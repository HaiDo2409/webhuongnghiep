package vn.edu.huongnghiep.modules.quizzes;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.modules.auth.CurrentActor;
import vn.edu.huongnghiep.modules.quizzes.domain.*;
import vn.edu.huongnghiep.shared.*;

@Service
public class QuizService {
    private final QuizVersionRepository versions;
    private final QuizResultRepository results;
    private final ObjectMapper mapper;
    private final ScoringRegistry scoring;
    private final CurrentActor actor;
    private final AuditService audit;
    public QuizService(QuizVersionRepository versions, QuizResultRepository results, ObjectMapper mapper,
                       ScoringRegistry scoring, CurrentActor actor, AuditService audit) {
        this.versions=versions; this.results=results; this.mapper=mapper; this.scoring=scoring; this.actor=actor; this.audit=audit;
    }
    public record QuizDto(UUID id, String type, int version, String title, String status, long revision, List<QuizQuestion> questions) {}
    public record DraftRequest(@NotBlank String type, @NotBlank @Size(max=255) String title,
                               @NotEmpty @Size(max=200) List<@Valid QuizQuestion> questions) {}
    public record SubmitRequest(@NotNull UUID quizVersionId, @NotNull @Size(max=200) Map<Integer,Integer> answers) {}
    public record ResultDto(UUID id, UUID quizVersionId, String type, int version, String title,
                            Object scores, Object normalizedScores, List<String> topCodes, Instant createdAt) {}
    private List<QuizQuestion> questions(QuizVersionEntity q) { return mapper.convertValue(q.questions, new TypeReference<>() {}); }
    private QuizDto dto(QuizVersionEntity q) { return new QuizDto(q.id,q.quizType,q.version,q.title,q.status,q.revision,questions(q)); }
    @Transactional(readOnly=true)
    public List<QuizDto> published() { return versions.findByStatusOrderByQuizType("PUBLISHED").stream().map(this::dto).toList(); }
    @Transactional(readOnly=true)
    public List<QuizDto> adminList() { actor.admin(); return versions.findAll().stream().filter(v->v.deletedAt==null).sorted(Comparator.comparingInt((QuizVersionEntity v)->v.version).reversed()).map(this::dto).toList(); }
    @Transactional
    public QuizDto draft(DraftRequest request) {
        var user=actor.admin(); scoring.get(request.type()).validate(request.questions());
        versions.lockByQuizType(request.type());
        var entity=new QuizVersionEntity(); entity.id=UUID.randomUUID(); entity.quizType=request.type();
        entity.version=versions.findFirstByQuizTypeOrderByVersionDesc(request.type()).map(v->v.version+1).orElse(1);
        entity.title=request.title().strip(); entity.status="DRAFT"; entity.questions=mapper.valueToTree(request.questions()); entity.createdAt=Instant.now();
        versions.saveAndFlush(entity); audit.record(user.id,"QUIZ_DRAFT_CREATED",entity.id); return dto(entity);
    }
    @Transactional
    public QuizDto publish(UUID id, long revision) {
        var user=actor.admin(); var type=versions.findQuizType(id).orElseThrow(ApiException::missing);
        var entity=versions.lockByQuizType(type).stream().filter(q->q.id.equals(id)).findFirst().orElseThrow(ApiException::missing);
        if(entity.deletedAt!=null) throw ApiException.missing();
        if (entity.revision!=revision) throw new ApiException(org.springframework.http.HttpStatus.CONFLICT,"Phiên bản đã thay đổi. Hãy tải lại trước khi chọn bộ câu hỏi.");
        if (entity.status.equals("PUBLISHED")) return dto(entity);
        if (!Set.of("DRAFT","ARCHIVED").contains(entity.status)) throw ApiException.invalid("Bộ câu hỏi không thể đưa vào sử dụng.");
        scoring.get(entity.quizType).validate(questions(entity));
        versions.archivePublished(entity.quizType); entity.status="PUBLISHED"; versions.saveAndFlush(entity);
        audit.record(user.id,"QUIZ_PUBLISHED",id); return dto(entity);
    }
    @Transactional
    public void deleteVersion(UUID id, long revision) {
        var user=actor.admin(); var type=versions.findQuizType(id).orElseThrow(ApiException::missing);
        var siblings=versions.lockByQuizType(type);
        var entity=siblings.stream().filter(q->q.id.equals(id)).findFirst().orElseThrow(ApiException::missing);
        if(entity.deletedAt!=null) throw ApiException.missing();
        if(entity.revision!=revision) throw new ApiException(org.springframework.http.HttpStatus.CONFLICT,"Phiên bản đã thay đổi. Hãy tải lại trước khi xóa.");
        if(siblings.stream().filter(q->q.deletedAt==null).count()<=1)
            throw ApiException.invalid("Mỗi loại trắc nghiệm phải còn ít nhất một bộ câu hỏi.");
        if(entity.status.equals("PUBLISHED"))
            throw ApiException.invalid("Bộ này đang được sử dụng. Hãy xuất bản một bộ cùng loại khác trước khi xóa.");
        entity.deletedAt=Instant.now(); versions.saveAndFlush(entity); audit.record(user.id,"QUIZ_DELETED",id);
    }
    @Transactional
    public QuizDto restoreVersion(UUID id) {
        var user=actor.admin(); var type=versions.findQuizType(id).orElseThrow(ApiException::missing);
        var entity=versions.lockByQuizType(type).stream().filter(q->q.id.equals(id)).findFirst().orElseThrow(ApiException::missing);
        if(entity.deletedAt!=null) { entity.deletedAt=null; versions.saveAndFlush(entity); audit.record(user.id,"QUIZ_RESTORED",id); }
        return dto(entity);
    }
    @Transactional
    public ResultDto submit(SubmitRequest request, HttpSession session) {
        var user=actor.optional();
        var quiz=versions.findById(request.quizVersionId()).orElseThrow(ApiException::missing);
        if(quiz.deletedAt!=null) throw ApiException.invalid("Bộ câu hỏi đã được gỡ. Hãy tải lại trang để làm bộ hiện tại.");
        // An archived version may have been loaded while it was published, but never accept a draft.
        Object pinned=session.getAttribute("quiz-version-"+quiz.quizType);
        if (!quiz.status.equals("PUBLISHED") && !(quiz.status.equals("ARCHIVED") && quiz.id.toString().equals(pinned)))
            throw ApiException.invalid("Bộ câu hỏi chưa xuất bản hoặc phiên làm bài đã hết hạn.");
        String resultKey="quiz-submitted-"+quiz.id;
        var existing=session.getAttribute(resultKey);
        if (existing instanceof String resultId) {
            var previous=results.findById(UUID.fromString(resultId)).orElse(null);
            boolean owned = previous != null && previous.deletedAt == null && (previous.userId == null || (user != null && user.id.equals(previous.userId)));
            if (owned && previous.answers.equals(mapper.valueToTree(request.answers()))) return resultDto(previous);
        }
        var scored=scoring.get(quiz.quizType).score(questions(quiz),request.answers());
        var result=new QuizResultEntity(); result.id=UUID.randomUUID();
        result.userId=user==null?null:user.id; result.quizVersionId=quiz.id; result.answers=mapper.valueToTree(request.answers());
        result.scores=mapper.valueToTree(scored.scores()); result.normalizedScores=mapper.valueToTree(scored.normalizedScores()); result.createdAt=Instant.now();
        results.save(result); session.setAttribute(resultKey,result.id.toString()); session.setAttribute("quiz-result-"+quiz.quizType,result.id.toString());
        return resultDto(result);
    }
    @Transactional(readOnly=true)
    public ResultDto resultDto(QuizResultEntity result) {
        var quiz=versions.findById(result.quizVersionId).orElseThrow(ApiException::missing);
        var normalized=mapper.convertValue(result.normalizedScores,new TypeReference<Map<String,Double>>() {});
        var top=scoring.get(quiz.quizType).dimensions().stream().sorted(Comparator.comparingDouble((String d)->normalized.get(d)).reversed()).limit(3).toList();
        return new ResultDto(result.id,quiz.id,quiz.quizType,quiz.version,quiz.title,result.scores,result.normalizedScores,top,result.createdAt);
    }
    @Transactional(readOnly=true)
    public List<ResultDto> history() { return results.findTop50ByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(actor.require().id).stream().map(this::resultDto).toList(); }
    @Transactional(readOnly=true)
    public ResultDto detail(UUID id) {
        var result=results.findByIdAndUserId(id,actor.require().id).orElseThrow(ApiException::missing);
        if(result.deletedAt!=null) throw ApiException.missing();
        return resultDto(result);
    }
    @Transactional
    public void delete(UUID id) {
        var user=actor.require();
        var result=results.lockById(id).orElseThrow(ApiException::missing);
        if(!user.id.equals(result.userId)) throw ApiException.missing();
        result.deletedAt=Instant.now(); results.save(result);
    }
    @Transactional
    public ResultDto restore(UUID id) {
        var user=actor.require();
        var result=results.lockById(id).orElseThrow(ApiException::missing);
        if(!user.id.equals(result.userId)) throw ApiException.missing();
        result.deletedAt=null; results.save(result); return resultDto(result);
    }
    @Transactional
    public void claim(HttpSession session) {
        var user=actor.require();
        for(String type:List.of("HOLLAND","MI")) {
            if(session.getAttribute("quiz-result-"+type) instanceof String id) {
                var result=results.lockById(UUID.fromString(id)).orElse(null);
                if(result!=null && result.deletedAt==null && result.userId==null) { result.userId=user.id; results.save(result); }
            }
        }
    }
}
