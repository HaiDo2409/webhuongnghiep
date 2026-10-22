package vn.edu.huongnghiep.modules.careers;

import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.modules.auth.CurrentActor;
import vn.edu.huongnghiep.shared.*;

@Service
public class CatalogTagService {
 private final JdbcTemplate jdbc;private final CurrentActor actor;private final AuditService audit;private final CareerRepository careers;private final ProgramRepository programs;
 public CatalogTagService(JdbcTemplate jdbc,CurrentActor actor,AuditService audit,CareerRepository careers,ProgramRepository programs){this.jdbc=jdbc;this.actor=actor;this.audit=audit;this.careers=careers;this.programs=programs;}
 public record TagInput(UUID id,String code,String name,boolean active,Long revision){}
 public record Assignment(String type,String targetId,Long revision,List<UUID> tagIds){}
 public record Decision(UUID programId,String decision,Long revision){}
 private void lock(){jdbc.execute("select pg_advisory_xact_lock(74310501)");}
 public void target(String type,String id){if(id==null||id.isBlank())throw ApiException.invalid("Thiếu đối tượng gắn tag.");if("CAREER".equals(type)){if(!careers.existsById(id))throw ApiException.missing();}else if("PROGRAM".equals(type)){try{if(!programs.existsById(UUID.fromString(id)))throw ApiException.missing();}catch(IllegalArgumentException e){throw ApiException.invalid("Mã chương trình không hợp lệ.");}}else throw ApiException.invalid("Loại đối tượng cần là CAREER hoặc PROGRAM.");}
 public long revision(String type,String id){var values=jdbc.queryForList("select revision from tag_assignment_versions where entity_type=? and entity_id=?",Long.class,type,id);return values.isEmpty()?0:values.getFirst();}
 private void checkRevision(String type,String id,Long expected){if(expected==null||expected!=revision(type,id))throw new ApiException(HttpStatus.CONFLICT,"Tag hoặc xác nhận liên kết đã thay đổi. Hãy tải lại danh sách trước khi lưu.");}
 private void bump(String type,String id){jdbc.update("insert into tag_assignment_versions(entity_type,entity_id,revision) values (?,?,1) on conflict(entity_type,entity_id) do update set revision=tag_assignment_versions.revision+1",type,id);}
 @Transactional(readOnly=true) public Object list(){actor.admin();return jdbc.queryForList("select id,code,name,active,origin,revision from catalog_tags order by name");}
 @Transactional public Object save(TagInput input){var user=actor.admin();lock();String name=input.name()==null?"":input.name().strip();String code=input.code()==null?"":input.code().strip().toUpperCase(Locale.ROOT);
  if(name.isBlank()||name.length()>160||!code.matches("[A-Z0-9][A-Z0-9_]{1,59}"))throw ApiException.invalid("Tên tag từ 1–160 ký tự. Mã gồm 2–60 chữ A–Z, số hoặc dấu gạch dưới.");
  UUID id=input.id()==null?UUID.randomUUID():input.id();var old=jdbc.queryForList("select code,revision from catalog_tags where id=?",id);
  if(input.id()!=null&&(old.isEmpty()||input.revision()==null||((Number)old.getFirst().get("revision")).longValue()!=input.revision()))throw new ApiException(HttpStatus.CONFLICT,"Tag đã thay đổi. Hãy tải lại.");
  if(!old.isEmpty()&&!old.getFirst().get("code").equals(code))throw ApiException.invalid("Không đổi mã tag đã tạo; có thể đổi tên hiển thị.");
  if(!jdbc.queryForList("select id from catalog_tags where (code=? or normalized_name=?) and id<>?",code,CareerWorkbookReader.key(name),id).isEmpty())throw new ApiException(HttpStatus.CONFLICT,"Mã hoặc tên tag đã có trong danh mục chung.");
  if(old.isEmpty())jdbc.update("insert into catalog_tags(id,code,name,normalized_name,active) values (?,?,?,?,?)",id,code,name,CareerWorkbookReader.key(name),input.active());
  else jdbc.update("update catalog_tags set name=?,normalized_name=?,active=?,revision=revision+1 where id=?",name,CareerWorkbookReader.key(name),input.active(),id);
  audit.record(user.id,"CATALOG_TAG_SAVED",id);return jdbc.queryForMap("select id,code,name,active,origin,revision from catalog_tags where id=?",id);
 }
 @Transactional(readOnly=true) public Object assignments(String type,String id){actor.admin();target(type,id);boolean career=type.equals("CAREER");return Map.of("revision",revision(type,id),"tagIds",jdbc.queryForList(career?"select tag_id from career_tags where career_id=?":"select tag_id from program_tags where program_id=?",UUID.class,career?id:UUID.fromString(id)));}
 @Transactional public Object assign(Assignment input){var user=actor.admin();lock();target(input.type(),input.targetId());checkRevision(input.type(),input.targetId(),input.revision());
  if(input.tagIds()==null||input.tagIds().size()>100||input.tagIds().contains(null))throw ApiException.invalid("Chọn tối đa 100 tag hợp lệ.");var ids=new LinkedHashSet<>(input.tagIds());
  for(UUID id:ids)if(jdbc.queryForList("select id from catalog_tags where id=? and active",UUID.class,id).isEmpty())throw ApiException.invalid("Tag không tồn tại hoặc đã ngừng sử dụng. Hãy tải lại danh mục.");
  boolean career=input.type().equals("CAREER");Object target=career?input.targetId():UUID.fromString(input.targetId());
  jdbc.update(career?"delete from career_tags where career_id=?":"delete from program_tags where program_id=?",target);
  for(UUID id:ids)jdbc.update(career?"insert into career_tags(career_id,tag_id) values (?,?)":"insert into program_tags(program_id,tag_id) values (?,?)",target,id);
  bump(input.type(),input.targetId());audit.record(user.id,"CATALOG_TAGS_ASSIGNED",input.type()+":"+input.targetId());return assignments(input.type(),input.targetId());
 }
 @Transactional public Object decide(String careerId,Decision input){var user=actor.admin();lock();target("CAREER",careerId);checkRevision("CAREER",careerId,input.revision());
  if(input.programId()==null||!programs.existsById(input.programId()))throw ApiException.invalid("Chương trình không tồn tại.");if(input.decision()==null||!List.of("EXCLUDE","RESET").contains(input.decision()))throw ApiException.invalid("Chỉ hỗ trợ loại trừ hoặc khôi phục gợi ý theo tag.");
  if(input.decision().equals("RESET")){jdbc.update("delete from career_program_decisions where career_id=? and program_id=?",careerId,input.programId());}
  else jdbc.update("insert into career_program_decisions(career_id,program_id,decision) values (?,?,?) on conflict(career_id,program_id) do update set decision=excluded.decision",careerId,input.programId(),input.decision());
  bump("CAREER",careerId);audit.record(user.id,"CAREER_PROGRAM_"+input.decision(),careerId+":"+input.programId());return Map.of("revision",revision("CAREER",careerId));
 }
}
