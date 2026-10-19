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
public class ProgramService {
    public static final Set<String> SUBJECTS=Set.of("toan","ly","hoa","sinh","tin","van","anh","su","dia");
    public static final List<String> HOLLAND=List.of("R","I","A","S","E","C");
    public record SubjectGroup(@NotBlank @Size(max=20) String code, @Size(min=3,max=3) @NotNull List<@NotBlank String> subjects) {}
    public record ProgramRequest(@NotBlank @Size(max=255) String school,@NotBlank @Size(max=100) String shortName,
        @NotBlank @Size(max=255) String major,@NotBlank @Size(max=30) String majorCode,@Min(2000) @Max(2100) int admissionYear,
        @NotEmpty @Size(max=20) List<@Valid SubjectGroup> subjectGroups,
        @NotNull @Size(max=6) Map<String,@NotNull @DecimalMin("0") @DecimalMax("100") Double> hollandProfile,
        @DecimalMin("0") @DecimalMax("30") BigDecimal benchmark,@Min(2000) @Max(2100) Integer benchmarkYear,
        @Size(max=2000) String sourceUrl,boolean verified,boolean published,long revision) {}
    public record ProgramDto(UUID id,String school,String shortName,String major,String majorCode,int admissionYear,
        List<SubjectGroup> subjectGroups,Map<String,Double> hollandProfile,BigDecimal benchmark,Integer benchmarkYear,
        String sourceUrl,boolean verified,boolean published,long revision) {}
    private final ProgramRepository repository;
    private final ObjectMapper mapper;
    private final CurrentActor actor;
    private final AuditService audit;
    public ProgramService(ProgramRepository repository,ObjectMapper mapper,CurrentActor actor,AuditService audit) {
        this.repository=repository;this.mapper=mapper;this.actor=actor;this.audit=audit;
    }
    public ProgramDto dto(ProgramEntity p) {
        return new ProgramDto(p.id,p.school,p.shortName,p.major,p.majorCode,p.admissionYear,
            mapper.convertValue(p.subjectGroups,new TypeReference<>(){}),mapper.convertValue(p.hollandProfile,new TypeReference<>(){}),
            p.benchmark,p.benchmarkYear,p.sourceUrl,p.verified,p.published,p.revision);
    }
    @Transactional(readOnly=true)
    public List<ProgramDto> list(boolean admin) {
        if(admin) actor.admin();
        return (admin?repository.findAll():repository.findByPublishedTrueOrderBySchoolAscMajorAsc()).stream().map(this::dto).toList();
    }
    @Transactional
    public ProgramDto save(UUID id,ProgramRequest r) {
        var user=actor.admin();
        var p=id==null?new ProgramEntity():repository.findById(id).orElseThrow(ApiException::missing);
        if(id!=null && p.revision!=r.revision()) throw new ApiException(org.springframework.http.HttpStatus.CONFLICT,"Thông tin ngành đã thay đổi. Hãy tải lại.");
        if(!HOLLAND.containsAll(r.hollandProfile().keySet())) throw ApiException.invalid("Hồ sơ Holland chỉ gồm R, I, A, S, E, C.");
        Set<String> groups=new HashSet<>();
        for(var group:r.subjectGroups()) if(!SUBJECTS.containsAll(group.subjects()) || new HashSet<>(group.subjects()).size()!=3 || !groups.add(group.code()))
            throw ApiException.invalid("Tổ hợp phải có ba môn khác nhau và mã tổ hợp không trùng.");
        if((r.benchmark()==null)!=(r.benchmarkYear()==null)) throw ApiException.invalid("Điểm tham khảo cần đi kèm năm công bố.");
        if(r.benchmarkYear()!=null && r.benchmarkYear()>r.admissionYear()) throw ApiException.invalid("Năm điểm tham khảo không được sau năm tuyển sinh.");
        if(r.sourceUrl()!=null && !r.sourceUrl().isBlank()) {
            try { var uri=URI.create(r.sourceUrl()); if(!Set.of("https","http").contains(uri.getScheme()) || uri.getHost()==null) throw new IllegalArgumentException(); }
            catch(IllegalArgumentException e) { throw ApiException.invalid("Nguồn phải là đường dẫn HTTP/HTTPS hợp lệ."); }
        }
        if(r.verified() && (r.sourceUrl()==null || r.sourceUrl().isBlank())) throw ApiException.invalid("Dữ liệu xác minh cần đường dẫn nguồn.");
        p.id=id==null?UUID.randomUUID():id;p.school=r.school().strip();p.shortName=r.shortName().strip();p.major=r.major().strip();p.majorCode=r.majorCode().strip();
        p.admissionYear=r.admissionYear();p.subjectGroups=mapper.valueToTree(r.subjectGroups());p.hollandProfile=mapper.valueToTree(r.hollandProfile());
        p.benchmark=r.benchmark();p.benchmarkYear=r.benchmarkYear();p.sourceUrl=r.sourceUrl();p.verified=r.verified();p.published=r.published();
        repository.saveAndFlush(p);audit.record(user.id,id==null?"PROGRAM_CREATED":"PROGRAM_UPDATED",p.id);return dto(p);
    }
}
