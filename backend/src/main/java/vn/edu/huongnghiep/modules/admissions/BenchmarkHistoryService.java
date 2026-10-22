package vn.edu.huongnghiep.modules.admissions;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.net.URI;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.modules.auth.CurrentActor;
import vn.edu.huongnghiep.shared.*;

@Service
public class BenchmarkHistoryService {
    public record Point(@NotBlank @Size(max=20) String group, @Min(2000) @Max(2100) int year,
        @NotNull @DecimalMin("0") @DecimalMax("30") BigDecimal score,
        @NotBlank @Size(max=2000) String sourceUrl, boolean verified, boolean comparable) {}
    public record Input(long revision, @NotNull @Size(max=60) List<@Valid Point> points) {}
    public record Data(UUID programId,long revision,List<Point> points) {}
    public record Estimate(BigDecimal reference,BigDecimal difference,String band,List<Point> points,List<Integer> missingYears,String note) {}
    private final ProgramRepository programs;
    private final ObjectMapper mapper;
    private final CurrentActor actor;
    private final AuditService audit;
    public BenchmarkHistoryService(ProgramRepository programs,ObjectMapper mapper,CurrentActor actor,AuditService audit) {
        this.programs=programs;this.mapper=mapper;this.actor=actor;this.audit=audit;
    }
    private List<Point> points(ProgramEntity p) {
        return p.benchmarkHistory==null?List.of():mapper.convertValue(p.benchmarkHistory,new TypeReference<>(){});
    }
    @Transactional(readOnly=true)
    public Data get(UUID id) { actor.admin();var p=programs.findById(id).orElseThrow(ApiException::missing);return new Data(id,p.revision,points(p)); }
    @Transactional
    public Data save(UUID id,Input input) {
        var user=actor.admin();var p=programs.findById(id).orElseThrow(ApiException::missing);
        if(p.revision!=input.revision()) throw new ApiException(org.springframework.http.HttpStatus.CONFLICT,"Chương trình đã thay đổi. Hãy tải lại trước khi lưu lịch sử.");
        var groups=mapper.convertValue(p.subjectGroups,new TypeReference<List<ProgramService.SubjectGroup>>(){});
        Set<String> seen=new HashSet<>();
        for(var point:input.points()) {
            if(point.year()>=p.admissionYear || groups.stream().noneMatch(g->g.code().equals(point.group())) || !seen.add(point.group()+":"+point.year()))
                throw ApiException.invalid("Lịch sử cần đúng tổ hợp, không trùng năm và trước năm dự tuyển.");
            try { var uri=URI.create(point.sourceUrl());if((!"http".equals(uri.getScheme()) && !"https".equals(uri.getScheme())) || uri.getHost()==null) throw new IllegalArgumentException(); }
            catch(IllegalArgumentException e) { throw ApiException.invalid("Nguồn lịch sử phải là URL HTTP/HTTPS hợp lệ."); }
        }
        p.benchmarkHistory=mapper.valueToTree(input.points());programs.saveAndFlush(p);audit.record(user.id,"BENCHMARK_HISTORY_UPDATED",p.id);
        return new Data(p.id,p.revision,points(p));
    }
    @Transactional(readOnly=true)
    public Map<UUID,List<Point>> publishedHistory() {
        Map<UUID,List<Point>> result=new HashMap<>();
        for(var p:programs.findByPublishedTrueOrderBySchoolAscMajorAsc()) result.put(p.id,points(p));
        return result;
    }
    @Transactional(readOnly=true)
    public Map<UUID,List<Point>> historyFor(Collection<UUID> ids) {
        Map<UUID,List<Point>> result=new HashMap<>();
        programs.findAllById(ids).forEach(p->result.put(p.id,points(p)));
        return result;
    }
    public static Estimate estimate(int year,String group,BigDecimal score,List<Point> history) {
        List<Point> selected=new ArrayList<>();List<Integer> missing=new ArrayList<>();
        for(int offset=1;offset<=3;offset++) {
            int expected=year-offset;
            var point=history.stream().filter(p->p.year()==expected && p.group().equals(group) && p.verified() && p.comparable()).findFirst();
            if(point.isPresent()) selected.add(point.get());else missing.add(expected);
        }
        if(!missing.isEmpty()) return new Estimate(null,null,"INSUFFICIENT_DATA",selected,missing,"Cần đủ ba năm cùng tổ hợp, phương thức THPT thang 30 không hệ số, đã kiểm tra nguồn và tính tương thích.");
        BigDecimal reference=PriorityCalculator.round(selected.get(0).score().multiply(new BigDecimal("0.5"))
            .add(selected.get(1).score().multiply(new BigDecimal("0.3"))).add(selected.get(2).score().multiply(new BigDecimal("0.2"))));
        BigDecimal difference=score==null?null:PriorityCalculator.round(score.subtract(reference));
        String band=difference==null?"NO_SCORE":difference.compareTo(new BigDecimal("-0.5"))<0?"BELOW":difference.compareTo(new BigDecimal("0.5"))>0?"ABOVE":"NEAR";
        return new Estimate(reference,difference,band,selected,List.of(),"Mốc xu hướng = 50% năm gần nhất + 30% năm trước + 20% năm còn lại. Biên ±0,5 điểm là quy ước tư vấn, không phải xác suất trúng tuyển.");
    }
}
