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
        @Size(max=2000) String sourceUrl,boolean verified,boolean published,long revision,UUID schoolId) {}
    public record ProgramDto(UUID id,String school,String shortName,String major,String majorCode,int admissionYear,
        List<SubjectGroup> subjectGroups,Map<String,Double> hollandProfile,BigDecimal benchmark,Integer benchmarkYear,
        String sourceUrl,boolean verified,boolean published,long revision,com.fasterxml.jackson.databind.JsonNode admissionDetails,UUID majorId,UUID schoolId) {
        public ProgramDto(UUID id,String school,String shortName,String major,String majorCode,int admissionYear,List<SubjectGroup> subjectGroups,Map<String,Double> hollandProfile,BigDecimal benchmark,Integer benchmarkYear,String sourceUrl,boolean verified,boolean published,long revision) {
            this(id,school,shortName,major,majorCode,admissionYear,subjectGroups,hollandProfile,benchmark,benchmarkYear,sourceUrl,verified,published,revision,null,null,null);
        }
    }
    private final ProgramRepository repository;
    private final ObjectMapper mapper;
    private final CurrentActor actor;
    private final AuditService audit;
    private final SchoolService schools;
    private final org.springframework.jdbc.core.JdbcTemplate jdbc;
    public ProgramService(ProgramRepository repository,ObjectMapper mapper,CurrentActor actor,AuditService audit,SchoolService schools,org.springframework.jdbc.core.JdbcTemplate jdbc) {
        this.repository=repository;this.mapper=mapper;this.actor=actor;this.audit=audit;this.schools=schools;this.jdbc=jdbc;
    }
    public ProgramDto dto(ProgramEntity p) {
        return new ProgramDto(p.id,p.school,p.shortName,p.major,p.majorCode,p.admissionYear,
            mapper.convertValue(p.subjectGroups,new TypeReference<>(){}),mapper.convertValue(p.hollandProfile,new TypeReference<>(){}),
            p.benchmark,p.benchmarkYear,p.sourceUrl,p.verified,p.published,p.revision,p.admissionDetails,p.majorId,p.schoolId);
    }
    /** Ranking needs small numeric inputs, not workbook metadata or benchmark history for every program. */
    @Transactional(readOnly=true)
    public List<ProgramDto> recommendationCandidates(int year) {
        return jdbc.query("""
            select p.id,p.school,p.short_name,p.major,p.major_code,p.admission_year,p.subject_groups::text,
                p.holland_profile::text,p.benchmark,p.benchmark_year,p.source_url,p.verified,p.published,p.revision,
                p.admission_details->'calculationSupported' as supported,p.major_id,p.school_id
            from programs p where p.published and p.admission_year=?
                and not exists(select 1 from schools s where not s.active and
                    (s.id=p.school_id or (p.school_id is null and s.code=upper(coalesce(p.admission_details->>'schoolCode',p.short_name)))))
            """, (rs,row)-> {
                try {
                    var details=mapper.createObjectNode();
                    if(rs.getString("supported")!=null) details.set("calculationSupported",mapper.readTree(rs.getString("supported")));
                    return new ProgramDto(rs.getObject("id",UUID.class),rs.getString("school"),rs.getString("short_name"),rs.getString("major"),rs.getString("major_code"),rs.getInt("admission_year"),
                        mapper.convertValue(mapper.readTree(rs.getString("subject_groups")),new TypeReference<>(){}),
                        mapper.convertValue(mapper.readTree(rs.getString("holland_profile")),new TypeReference<>(){}),
                        rs.getBigDecimal("benchmark"),(Integer)rs.getObject("benchmark_year"),rs.getString("source_url"),rs.getBoolean("verified"),rs.getBoolean("published"),rs.getLong("revision"),details,rs.getObject("major_id",UUID.class),rs.getObject("school_id",UUID.class));
                } catch(com.fasterxml.jackson.core.JsonProcessingException e) { throw new java.sql.SQLException("Invalid program scoring data",e); }
            },year);
    }
    @Transactional(readOnly=true)
    public Map<UUID,ProgramDto> recommendationDetails(Collection<UUID> ids) {
        Map<UUID,ProgramDto> result=new HashMap<>();
        repository.findAllById(ids).forEach(p->result.put(p.id,dto(p)));
        return result;
    }
    @Transactional(readOnly=true)
    public List<ProgramDto> list(boolean admin) {
        if(admin) actor.admin();
        var hidden=admin?Set.<UUID>of():schools.hiddenIds();
        var hiddenCodes=admin?Set.<String>of():schools.hiddenCodes();
        return (admin?repository.findAll():repository.findByPublishedTrueOrderBySchoolAscMajorAsc()).stream().filter(p->p.schoolId!=null?!hidden.contains(p.schoolId):!hiddenCodes.contains(p.admissionDetails.path("schoolCode").asText(p.shortName).toUpperCase(Locale.ROOT))).map(this::dto).toList();
    }
    @Transactional
    public ProgramDto save(UUID id,ProgramRequest r) {
        var user=actor.admin();
        schools.lock();
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
        var school=r.schoolId()==null?schools.ensure(r.shortName(),r.school()):schools.require(r.schoolId());
        boolean contextChanged=id!=null && (!Objects.equals(p.schoolId,school.id) || !Objects.equals(p.major,r.major().strip()) || !Objects.equals(p.majorCode,r.majorCode().strip())
            || p.admissionYear!=r.admissionYear() || !Objects.equals(p.subjectGroups,mapper.valueToTree(r.subjectGroups())));
        if(contextChanged && p.benchmarkHistory!=null && p.benchmarkHistory.isArray()) {
            var revised=p.benchmarkHistory.deepCopy();
            revised.forEach(point->{ if(point instanceof com.fasterxml.jackson.databind.node.ObjectNode node) node.put("comparable",false); });
            p.benchmarkHistory=revised;
        }
        p.id=id==null?UUID.randomUUID():id;p.schoolId=school.id;p.school=school.name;p.shortName=school.code;p.major=r.major().strip();p.majorCode=r.majorCode().strip();
        var details=p.admissionDetails instanceof com.fasterxml.jackson.databind.node.ObjectNode node?node.deepCopy():mapper.createObjectNode();details.put("schoolCode",school.code);p.admissionDetails=details;
        p.admissionYear=r.admissionYear();p.subjectGroups=mapper.valueToTree(r.subjectGroups());p.hollandProfile=mapper.valueToTree(r.hollandProfile());
        p.benchmark=r.benchmark();p.benchmarkYear=r.benchmarkYear();p.sourceUrl=r.sourceUrl();p.verified=r.verified();p.published=r.published();
        repository.saveAndFlush(p);audit.record(user.id,id==null?"PROGRAM_CREATED":"PROGRAM_UPDATED",p.id);return dto(p);
    }
}
