package vn.edu.huongnghiep.modules.recommendations;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.modules.admissions.*;
import vn.edu.huongnghiep.modules.auth.CurrentActor;
import vn.edu.huongnghiep.shared.ApiException;

@Service
public class RecommendationService {
    public enum Mode { POINTS, INTEREST, COMBINED }
    public record Request(@Min(2000) @Max(2100) int year, @NotNull Mode mode, UUID quizResultId,
        @NotNull @Size(max=9) Map<String,@NotNull @DecimalMin("0") @DecimalMax("10") BigDecimal> scores) {}
    public record Item(ProgramService.ProgramDto program,Double compatibility,BigDecimal rawScore,String bestGroup,
                       BigDecimal rawDifference,List<String> reasons) {}
    public record Response(UUID id,List<Item> items,String calculationNote) {}
    private final ProgramService programs;
    private final QuizResultRepository results;
    private final QuizVersionRepository versions;
    private final RecommendationRunRepository runs;
    private final ObjectMapper mapper;
    private final CurrentActor actor;
    private final CompatibilityCalculator compatibility=new CompatibilityCalculator();
    private final SubjectScoreCalculator calculator=new SubjectScoreCalculator();
    public RecommendationService(ProgramService programs,QuizResultRepository results,QuizVersionRepository versions,
        RecommendationRunRepository runs,ObjectMapper mapper,CurrentActor actor) {
        this.programs=programs;this.results=results;this.versions=versions;this.runs=runs;this.mapper=mapper;this.actor=actor;
    }
    @Transactional
    public Response recommend(Request request,HttpSession session) {
        if(!ProgramService.SUBJECTS.containsAll(request.scores().keySet())) throw ApiException.invalid("Môn học không hợp lệ.");
        var user=actor.optional(); Map<String,Double> profile=null;
        if(request.quizResultId()!=null) {
            var result=results.findById(request.quizResultId()).orElseThrow(ApiException::missing);
            if(result.deletedAt!=null) throw ApiException.missing();
            boolean owned=user!=null && user.id.equals(result.userId);
            boolean guest=result.userId==null && result.id.toString().equals(session.getAttribute("quiz-result-HOLLAND"));
            if(!owned && !guest) throw ApiException.missing();
            var quiz=versions.findById(result.quizVersionId).orElseThrow(ApiException::missing);
            if(!quiz.quizType.equals("HOLLAND")) throw ApiException.invalid("Cá nhân hóa xét tuyển cần kết quả Holland.");
            profile=mapper.convertValue(result.normalizedScores,new TypeReference<>(){});
        }
        List<Item> items=new ArrayList<>();
        for(var p:programs.list(false)) {
            if(p.admissionYear()!=request.year()) continue;
            Double fit=compatibility.compare(profile,p.hollandProfile());
            var score=calculator.best(request.scores(),p.subjectGroups());
            BigDecimal raw=score.map(SubjectScoreCalculator.Score::rawScore).orElse(null);
            BigDecimal diff=raw!=null && p.benchmark()!=null?raw.subtract(p.benchmark()):null;
            List<String> reasons=new ArrayList<>();
            reasons.add(fit==null?"Chưa có hồ sơ hướng nghiệp đủ để đánh giá.":"Độ tương đồng Holland: "+fit+"/100; không phải xác suất đỗ.");
            if(raw==null) reasons.add("Chưa đủ điểm cho một tổ hợp ba môn.");
            if(!p.verified()) reasons.add("Dữ liệu minh họa/chưa xác minh; không dùng làm căn cứ tuyển sinh chính thức.");
            if(p.benchmark()!=null) reasons.add("Mốc tham khảo năm "+p.benchmarkYear()+"; chưa kết luận đáp ứng điều kiện.");
            items.add(new Item(p,fit,raw,score.map(SubjectScoreCalculator.Score::group).orElse(null),diff,reasons));
        }
        Comparator<Item> byFit=Comparator.comparing(Item::compatibility,Comparator.nullsLast(Comparator.reverseOrder()));
        Comparator<Item> byScore=Comparator.comparing(Item::rawScore,Comparator.nullsLast(Comparator.reverseOrder()));
        Comparator<Item> order=switch(request.mode()) {
            case POINTS -> byScore;
            case INTEREST -> byFit.thenComparing(byScore);
            case COMBINED -> Comparator.comparing((Item i)->i.rawScore()==null).thenComparing(byFit).thenComparing(byScore);
        };
        items.sort(order.thenComparing(i->i.program().major()));
        UUID runId=UUID.randomUUID();
        if(user!=null) {
            var run=new RecommendationRunEntity();run.id=runId;run.userId=user.id;run.quizResultId=request.quizResultId();
            run.inputSnapshot=mapper.valueToTree(request);run.resultSnapshot=mapper.valueToTree(items);run.algorithmVersion="raw-subjects-holland-v1";run.createdAt=Instant.now();runs.save(run);
        }
        return new Response(runId,items,"Hiện hỗ trợ tổng điểm ba môn thang 30, chưa áp dụng ưu tiên, hệ số hoặc quy đổi chứng chỉ. Chênh lệch chỉ đối chiếu điểm thô; không phải điểm xét tuyển cuối cùng hay dự báo trúng tuyển.");
    }
}
