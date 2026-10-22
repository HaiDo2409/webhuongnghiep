package vn.edu.huongnghiep.modules.admissions;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.modules.auth.CurrentActor;
import vn.edu.huongnghiep.shared.*;
@Service
public class SchoolService {
 private final SchoolRepository schools;private final JdbcTemplate jdbc;private final CurrentActor actor;private final AuditService audit;
 public SchoolService(SchoolRepository schools,JdbcTemplate jdbc,CurrentActor actor,AuditService audit){this.schools=schools;this.jdbc=jdbc;this.actor=actor;this.audit=audit;}
 public record Input(String code,String name,String website,boolean active,Long revision){}
 public record Dto(UUID id,String code,String name,String website,boolean active,long revision,int programCount,int publicProgramCount,List<Integer> years){}
 public void lock(){jdbc.execute("select pg_advisory_xact_lock(74310501)");}
 private String code(String value){String code=value==null?"":value.strip().toUpperCase(Locale.ROOT);if(!code.matches("[A-Z0-9][A-Z0-9_-]{1,99}"))throw ApiException.invalid("Mã trường cần 2–100 chữ A–Z, số, dấu gạch ngang hoặc gạch dưới.");return code;}
 private String name(String value){if(value==null||value.isBlank()||value.strip().length()>255)throw ApiException.invalid("Tên trường không được trống, tối đa 255 ký tự.");return value.strip();}
 public SchoolEntity require(UUID id){return schools.findById(id).orElseThrow(ApiException::missing);}
 @Transactional public SchoolEntity ensure(String rawCode,String rawName){lock();String key=code(rawCode);var existing=schools.findByCode(key).orElse(null);if(existing!=null)return existing;var school=new SchoolEntity();school.id=UUID.randomUUID();school.code=key;school.name=name(rawName);return schools.saveAndFlush(school);}
 private static final String MATCH="(school_id=? or (school_id is null and upper(coalesce(admission_details->>'schoolCode',short_name))=?))";
 private Dto dto(SchoolEntity s){var counts=jdbc.queryForMap("select count(*) as total,count(*) filter(where published) as public_count from programs where "+MATCH,s.id,s.code);var years=jdbc.queryForList("select distinct admission_year from programs where "+MATCH+" and published order by admission_year",Integer.class,s.id,s.code);return new Dto(s.id,s.code,s.name,s.website,s.active,s.revision,((Number)counts.get("total")).intValue(),((Number)counts.get("public_count")).intValue(),years);}
 @Transactional(readOnly=true) public List<Dto> list(boolean admin){if(admin)actor.admin();return schools.findAllByOrderByNameAsc().stream().filter(s->admin||s.active).map(this::dto).toList();}
 @Transactional(readOnly=true) public SchoolEntity publicSchool(String rawCode){var s=schools.findByCode(rawCode.toUpperCase(Locale.ROOT)).orElseThrow(ApiException::missing);if(!s.active)throw ApiException.missing();return s;}
 public Set<UUID> hiddenIds(){Set<UUID> result=new HashSet<>();for(var s:schools.findAll())if(!s.active)result.add(s.id);return result;}
 public Set<String> hiddenCodes(){Set<String> result=new HashSet<>();for(var s:schools.findAll())if(!s.active)result.add(s.code);return result;}
 @Transactional public Dto save(UUID id,Input input){var user=actor.admin();lock();String code=code(input.code()),name=name(input.name());String website=input.website()==null||input.website().isBlank()?null:input.website().strip();
  if(website!=null&&(website.length()>2000||!vn.edu.huongnghiep.modules.careers.CareerWorkbookReader.validUrl(website)))throw ApiException.invalid("Website trường phải là URL HTTP/HTTPS hợp lệ, tối đa 2.000 ký tự.");
  SchoolEntity s=id==null?new SchoolEntity():require(id);
  if(id!=null&&(input.revision()==null||input.revision()!=s.revision))throw new ApiException(HttpStatus.CONFLICT,"Trường đã thay đổi. Hãy tải lại trước khi lưu.");
  if(id!=null&&!s.code.equals(code))throw ApiException.invalid("Không đổi mã trường đã tạo; có thể sửa tên và website.");
  if(id==null&&schools.findByCode(code).isPresent())throw new ApiException(HttpStatus.CONFLICT,"Mã trường đã tồn tại, kể cả trường đang ẩn.");
  if(id==null){s.id=UUID.randomUUID();s.code=code;}boolean renamed=id!=null&&!s.name.equals(name);
  s.name=name;s.website=website;s.active=input.active();schools.saveAndFlush(s);
  if(renamed)jdbc.update("update programs set school=?,short_name=?,school_id=?,revision=revision+1 where "+MATCH,s.name,s.code,s.id,s.id,s.code);
  audit.record(user.id,id==null?"SCHOOL_CREATED":"SCHOOL_UPDATED",s.id);return dto(s);
 }
 @Transactional public void delete(UUID id,long revision){var user=actor.admin();lock();var s=require(id);if(s.revision!=revision)throw new ApiException(HttpStatus.CONFLICT,"Trường đã thay đổi. Hãy tải lại trước khi xóa.");
  if(jdbc.queryForObject("select count(*) from programs where "+MATCH,Long.class,id,s.code)>0)throw new ApiException(HttpStatus.CONFLICT,"Trường đã có chương trình. Hãy ẩn trường để giữ dữ liệu và lịch sử.");
  audit.record(user.id,"SCHOOL_DELETED",id);schools.delete(s);schools.flush();
 }
}
