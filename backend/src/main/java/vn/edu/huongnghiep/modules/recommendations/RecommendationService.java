package vn.edu.huongnghiep.modules.recommendations;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
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
    public record Page(@Min(0) @Max(1000000) int offset,@Min(1) @Max(50) int limit,
        @Size(max=255) String major,boolean verifiedOnly,UUID programId) {}
    public record Request(@Min(2000) @Max(2100) int year, @NotNull Mode mode, UUID quizResultId,
        @NotNull @Size(max=9) Map<String,@NotNull @DecimalMin("0") @DecimalMax("10") BigDecimal> scores,
        @Valid PriorityCalculator.Priority priority,@Valid Page page) {
        public Request(int year,Mode mode,UUID quizResultId,Map<String,BigDecimal> scores,PriorityCalculator.Priority priority) { this(year,mode,quizResultId,scores,priority,null); }
        public Request(int year,Mode mode,UUID quizResultId,Map<String,BigDecimal> scores) { this(year,mode,quizResultId,scores,null); }
    }
    public record Item(ProgramService.ProgramDto program,Double compatibility,BigDecimal rawScore,String bestGroup,
                       BigDecimal rawDifference,List<String> reasons,BigDecimal priorityScore,BigDecimal admissionScore,
                       BenchmarkHistoryService.Estimate estimate) {}
    public record Response(UUID id,List<Item> items,String calculationNote,int total,int offset,boolean hasMore) {}
    private final ProgramService programs;
    private final QuizResultRepository results;
    private final QuizVersionRepository versions;
    private final RecommendationRunRepository runs;
    private final ObjectMapper mapper;
    private final CurrentActor actor;
    private final BenchmarkHistoryService history;
    private final vn.edu.huongnghiep.modules.careers.CareerCatalogService careerCatalog;
    private final PriorityCalculator priorities=new PriorityCalculator();
    private final CompatibilityCalculator compatibility=new CompatibilityCalculator();
    private final SubjectScoreCalculator calculator=new SubjectScoreCalculator();
    public RecommendationService(ProgramService programs,QuizResultRepository results,QuizVersionRepository versions,
        RecommendationRunRepository runs,ObjectMapper mapper,CurrentActor actor,BenchmarkHistoryService history,vn.edu.huongnghiep.modules.careers.CareerCatalogService careerCatalog) {
        this.programs=programs;this.results=results;this.versions=versions;this.runs=runs;this.mapper=mapper;this.actor=actor;this.history=history;this.careerCatalog=careerCatalog;
    }
    @Transactional
    public Response recommend(Request request,HttpSession session) {
        if(!ProgramService.SUBJECTS.containsAll(request.scores().keySet())) throw ApiException.invalid("Môn học không hợp lệ.");
        if(request.priority()!=null && request.year()!=2026) throw ApiException.invalid("Quy tắc ưu tiên hiện được đối chiếu cho năm 2026. Chọn năm 2026 hoặc bỏ thông tin ưu tiên.");
        if(request.priority()!=null) priorities.calculate(BigDecimal.ZERO,new BigDecimal("30"),request.year(),request.priority());
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
        var careerFits=profile==null?Map.<UUID,Double>of():careerCatalog.programCompatibility(profile);
        for(var p:request.page()==null?programs.list(false):programs.recommendationCandidates(request.year())) {
            if(p.admissionYear()!=request.year()) continue;
            var page=request.page();
            if(page!=null && ((page.verifiedOnly() && !p.verified()) || (page.programId()!=null && !page.programId().equals(p.id()))
                || (page.major()!=null && !p.major().toLowerCase(Locale.ROOT).contains(page.major().toLowerCase(Locale.ROOT))))) continue;
            Double fit=compatibility.compare(profile,p.hollandProfile());
            if(fit==null)fit=careerFits.get(p.id());
            boolean supported=p.admissionDetails()==null||!p.admissionDetails().has("calculationSupported")||p.admissionDetails().path("calculationSupported").asBoolean();
            var score=supported?calculator.best(request.scores(),p.subjectGroups()):Optional.<SubjectScoreCalculator.Score>empty();
            BigDecimal raw=score.map(SubjectScoreCalculator.Score::rawScore).orElse(null);
            BigDecimal priority=raw==null?null:priorities.calculate(raw,new BigDecimal("30"),request.year(),request.priority());
            BigDecimal admission=raw==null?null:PriorityCalculator.round(raw.add(priority).min(new BigDecimal("30")));
            BigDecimal diff=raw!=null && p.benchmark()!=null?raw.subtract(p.benchmark()):null;
            items.add(new Item(p,fit,raw,score.map(SubjectScoreCalculator.Score::group).orElse(null),diff,List.of(),priority,admission,null));
        }
        Comparator<Item> byFit=Comparator.comparing(Item::compatibility,Comparator.nullsLast(Comparator.reverseOrder()));
        Comparator<Item> byScore=Comparator.comparing(Item::admissionScore,Comparator.nullsLast(Comparator.reverseOrder()));
        Comparator<Item> order=switch(request.mode()) {
            case POINTS -> byScore;
            case INTEREST -> byFit.thenComparing(byScore);
            case COMBINED -> Comparator.comparing((Item i)->i.rawScore()==null).thenComparing(byFit).thenComparing(byScore);
        };
        items.sort(order.thenComparing(i->i.program().major()).thenComparing(i->i.program().id()));
        int total=items.size();
        int offset=request.page()==null?0:Math.min(total,request.page().offset());
        int end=request.page()==null?total:Math.min(total,offset+request.page().limit());
        var selected=items.subList(offset,end);
        var ids=selected.stream().map(i->i.program().id()).toList();
        var histories=history.historyFor(ids);
        var details=request.page()==null?Map.<UUID,ProgramService.ProgramDto>of():programs.recommendationDetails(ids);
        List<Item> enriched=new ArrayList<>();
        for(var item:selected) {
            var p=details.getOrDefault(item.program().id(),item.program());
            Double fit=item.compatibility();BigDecimal raw=item.rawScore(),priority=item.priorityScore(),admission=item.admissionScore();
            boolean supported=p.admissionDetails()==null||!p.admissionDetails().has("calculationSupported")||p.admissionDetails().path("calculationSupported").asBoolean();
            List<String> reasons=new ArrayList<>();
            reasons.add(fit==null?"Chưa có hồ sơ hướng nghiệp đủ để đánh giá.":"Độ tương đồng Holland: "+fit+"/100; không phải xác suất đỗ.");
            if(raw==null) reasons.add(supported?"Chưa đủ điểm cho một tổ hợp ba môn.":"Công thức hoặc thang điểm trong file cần rà soát; chỉ hiển thị điểm chuẩn gốc, chưa tự tính điểm xét tuyển cho chương trình này.");
            if(!p.verified()) reasons.add("Dữ liệu minh họa/chưa xác minh; không dùng làm căn cứ tuyển sinh chính thức.");
            if(p.benchmark()!=null) reasons.add("Mốc tham khảo năm "+p.benchmarkYear()+"; chưa kết luận đáp ứng điều kiện.");
            if(p.hollandProfile().isEmpty() && fit!=null)reasons.add("Độ phù hợp ngành là trung bình tối đa ba nghề liên quan có độ tương đồng cao nhất, dựa trên hồ sơ O*NET; không làm thay đổi điểm xét tuyển.");
            if(p.admissionDetails()!=null && p.admissionDetails().hasNonNull("secondaryCriteria"))reasons.add("Tiêu chí phụ khi bằng điểm chuẩn: "+p.admissionDetails().path("secondaryCriteria").asText());
            reasons.add("Tính theo tổ hợp ba môn không hệ số; chưa xử lý điểm thưởng, điều kiện phụ hoặc công thức riêng của ngành. Cần kiểm tra với trường trước khi đăng ký.");
            if(priority!=null) reasons.add("Điểm ưu tiên: "+priority+". Ưu tiên khu vực chỉ trong năm tốt nghiệp và năm kế tiếp; giảm dần từ 22,5/30.");
            var estimate=BenchmarkHistoryService.estimate(request.year(),Objects.toString(item.bestGroup(),""),admission,histories.getOrDefault(p.id(),List.of()));
            enriched.add(new Item(p,fit,raw,item.bestGroup(),item.rawDifference(),reasons,priority,admission,estimate));
        }
        items=enriched;
        UUID runId=UUID.randomUUID();
        if(user!=null && (request.page()==null || request.page().offset()==0)) {
            var run=new RecommendationRunEntity();run.id=runId;run.userId=user.id;run.quizResultId=request.quizResultId();
            run.inputSnapshot=mapper.valueToTree(request);run.resultSnapshot=mapper.valueToTree(items);run.algorithmVersion=request.page()==null?"thpt-priority-trend-v2":"thpt-priority-trend-v2-paged";run.createdAt=Instant.now();runs.save(run);
        }
        return new Response(runId,items,(request.year()==2026?"THPT: tổng ba môn không hệ số + ưu tiên theo thông tin tự khai (quy tắc 2026). ":"Năm này chỉ tính tổng ba môn không hệ số, chưa áp dụng ưu tiên. ")+"Mốc xu hướng cần đủ ba năm có nguồn, cùng phương thức và tổ hợp. Holland chỉ giúp sắp xếp ngành, không cộng vào điểm; không hiển thị xác suất đỗ khi chưa có mô hình được kiểm chứng.",total,offset,end<total);
    }
}
