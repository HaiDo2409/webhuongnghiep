package vn.edu.huongnghiep.modules.careers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.modules.auth.CurrentActor;
import vn.edu.huongnghiep.shared.*;

@Service
public class CareerImportService {
    private final CareerWorkbookReader reader;private final CareerRepository careers;private final CareerImportJobRepository jobs;
    private final CurrentActor actor;private final ObjectMapper mapper;private final JdbcTemplate jdbc;private final AuditService audit;
    private final CatalogSupplementService supplements;
    public record Planned(CareerWorkbookReader.RowData input,String id,long expectedRevision,String action,JsonNode before,JsonNode after,boolean beforePublished) {}
    public record Preview(UUID id,String filename,String sheet,String checksum,String status,int added,int updated,int unchanged,List<CareerWorkbookReader.Issue> errors,List<Planned> rows,Map<String,Integer> supplementaryCounts) {}
    public CareerImportService(CareerWorkbookReader reader,CareerRepository careers,CareerImportJobRepository jobs,CurrentActor actor,ObjectMapper mapper,JdbcTemplate jdbc,AuditService audit,CatalogSupplementService supplements) {
        this.reader=reader;this.careers=careers;this.jobs=jobs;this.actor=actor;this.mapper=mapper;this.jdbc=jdbc;this.audit=audit;this.supplements=supplements;
    }
    public static String hash(byte[] data) {try {return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(data));} catch(Exception e){throw new IllegalStateException(e);}}
    public static String groupId(String name) { return hash(CareerWorkbookReader.key(name).getBytes(StandardCharsets.UTF_8)); }
    public ObjectNode merge(CareerWorkbookReader.RowData row,JsonNode existing) {
        ObjectNode data=existing==null?mapper.createObjectNode():existing.deepCopy();
        data.put("onetCode",row.code());data.put("hollandCode",row.holland());data.put("nameEn",row.nameEn());data.put("nameVi",row.nameVi());data.put("description",row.description());
        data.set("codes",mapper.valueToTree(row.holland().chars().mapToObj(c->String.valueOf((char)c)).toList()));
        data.set("majorNames",mapper.valueToTree(row.majors()));
        data.set("groups",mapper.valueToTree(row.groups().stream().map(name->Map.of("id",groupId(name),"name",name)).toList()));
        if(!data.has("skills")) data.set("skills",mapper.createArrayNode());
        if(!data.has("stemGroups")) data.set("stemGroups",mapper.valueToTree(inferStem(row.groups())));
        for(var entry:row.extras().entrySet()) switch(entry.getKey()) {
            case "skills_vi" -> data.set("skills",mapper.valueToTree(Arrays.stream(entry.getValue().split(";")).map(String::strip).filter(v->!v.isEmpty()).distinct().toList()));
            case "stem_groups" -> data.set("stemGroups",mapper.valueToTree(Arrays.stream(entry.getValue().split(";")).map(String::strip).toList()));
            case "salary_min_vnd" -> data.put("salaryMinVnd",Long.parseLong(entry.getValue()));
            case "salary_max_vnd" -> data.put("salaryMaxVnd",Long.parseLong(entry.getValue()));
            case "salary_period" -> data.put("salaryPeriod",entry.getValue());case "salary_region" -> data.put("salaryRegion",entry.getValue());
            case "salary_year" -> data.put("salaryYear",Integer.parseInt(entry.getValue()));case "salary_source_url" -> data.put("salarySourceUrl",entry.getValue());
            case "outlook_vi" -> data.put("outlook",entry.getValue());case "outlook_region" -> data.put("outlookRegion",entry.getValue());
            case "outlook_year" -> data.put("outlookYear",Integer.parseInt(entry.getValue()));case "outlook_source_url" -> data.put("outlookSourceUrl",entry.getValue());
            case "source_url" -> data.put("sourceUrl",entry.getValue());case "data_year" -> data.put("dataYear",Integer.parseInt(entry.getValue()));
            default -> { }
        }
        return data;
    }
    private Set<String> inferStem(List<String> groups) {
        Set<String> result=new LinkedHashSet<>();
        for(String g:groups) {
            if(g.contains("Máy tính")||g.contains("An toàn thông tin"))result.add("T");
            if(g.contains("Kỹ thuật")||g.contains("Cơ khí")||g.contains("Điện –")||g.contains("Xây dựng"))result.add("E");
            if(g.contains("Khoa học tự nhiên")||g.contains("Khoa học sự sống")||g.contains("Môi trường"))result.add("S");
            if(g.contains("Định phí"))result.add("M");
        }
        if(result.isEmpty())result.add("OTHER");return result;
    }
    @Transactional
    public Preview preview(byte[] bytes,String filename,String sheet) {var user=actor.admin();return prepare(bytes,filename,sheet,user.id);}
    public Preview prepare(byte[] bytes,String filename,String sheet,UUID actorId) {
        var parsed=reader.read(bytes,sheet);List<Planned> planned=new ArrayList<>();List<CareerWorkbookReader.Issue> errors=new ArrayList<>(parsed.errors());
        var supplementPlan=supplements.plan(parsed.supplements(),parsed.rows().stream().map(CareerWorkbookReader.RowData::code).collect(java.util.stream.Collectors.toSet()),errors);
        if(errors.isEmpty()) for(var row:parsed.rows()) {
            var old=careers.findByOnetCode(row.code()).orElse(null);String id=old==null?"onet-"+row.code():old.id;
            JsonNode after=merge(row,old==null?null:old.data);boolean published=row.extras().containsKey("published")?"TRUE".equals(row.extras().get("published")):old==null||old.published;
            String action=old==null?"ADD":old.data.equals(after)&&old.published==published?"UNCHANGED":"UPDATE";
            planned.add(new Planned(row,id,old==null?-1:old.revision,action,old==null?null:old.data,after,old!=null&&old.published));
        }
        UUID id=null;String digest=hash(bytes);
        if(errors.isEmpty()) {var job=new CareerImportJobEntity();job.id=UUID.randomUUID();job.actorId=actorId;job.filename=filename.substring(0,Math.min(filename.length(),255));job.checksum=digest;job.status="PREVIEW";
            job.rows=mapper.valueToTree(planned);job.supplements=supplementPlan;job.changes=mapper.createArrayNode();job.createdAt=Instant.now();jobs.save(job);id=job.id;}
        return new Preview(id,filename,parsed.sheet(),digest,"PREVIEW",(int)planned.stream().filter(r->r.action().equals("ADD")).count(),(int)planned.stream().filter(r->r.action().equals("UPDATE")).count(),(int)planned.stream().filter(r->r.action().equals("UNCHANGED")).count(),errors,planned,Map.of("majors",parsed.supplements().majors().size(),"programs",parsed.supplements().programs().size(),"benchmarks",parsed.supplements().benchmarks().size()));
    }
    @Transactional
    public Object commit(UUID id) {var user=actor.admin();return apply(id,user.id);}
    public Object apply(UUID id,UUID actorId) {
        jdbc.execute("select pg_advisory_xact_lock(74310501)");
        var job=jobs.lockById(id).orElseThrow(ApiException::missing);
        if(job.status.equals("COMMITTED")) return summary(job);
        if(!job.status.equals("PREVIEW")) throw ApiException.invalid("Lần nhập đã được khôi phục, hãy tạo xem trước mới.");
        var rows=mapper.convertValue(job.rows,new TypeReference<List<Planned>>(){});ArrayNode changes=mapper.createArrayNode();
        var supplementState=(ObjectNode)job.supplements; supplementState.set("applied",supplements.apply(supplementState));job.supplements=supplementState;
        for(var row:rows) {
            var old=careers.findByOnetCode(row.input().code()).orElse(null);
            if((old==null? -1:old.revision)!=row.expectedRevision()) throw new ApiException(org.springframework.http.HttpStatus.CONFLICT,"Dữ liệu nghề đã thay đổi sau lúc xem trước: "+row.input().code());
            if(row.action().equals("UNCHANGED"))continue;
            var entity=old==null?new CareerEntity():old;entity.id=row.id();entity.onetCode=row.input().code();entity.data=row.after().deepCopy();entity.published=row.input().extras().containsKey("published")?"TRUE".equals(row.input().extras().get("published")):old==null||row.beforePublished();
            careers.saveAndFlush(entity);syncLinks(entity);
            ObjectNode change=mapper.valueToTree(row);change.put("appliedRevision",entity.revision);changes.add(change);
        }
        job.changes=changes;job.status="COMMITTED";job.committedAt=Instant.now();jobs.save(job);audit.record(actorId,"CAREERS_IMPORTED",job.id);return summary(job);
    }
    public void syncLinks(CareerEntity entity) {
        jdbc.update("delete from career_group_links where career_id=?",entity.id);jdbc.update("delete from career_major_links where career_id=?",entity.id);
        for(var group:entity.data.path("groups")) {String id=group.path("id").asText(),name=group.path("name").asText();jdbc.update("insert into career_groups(id,name) values (?,?) on conflict(id) do nothing",id,name);jdbc.update("insert into career_group_links(career_id,group_id) values (?,?) on conflict do nothing",entity.id,id);}
        for(var major:entity.data.path("majorNames")) {String name=major.asText(),key=CareerWorkbookReader.key(name);UUID id=UUID.nameUUIDFromBytes(("major:"+key).getBytes(StandardCharsets.UTF_8));
            jdbc.update("insert into majors(id,name,normalized_name) values (?,?,?) on conflict(normalized_name) do nothing",id,name,key);
            UUID actual=jdbc.queryForObject("select id from majors where normalized_name=?",UUID.class,key);jdbc.update("insert into career_major_links(career_id,major_id) values (?,?) on conflict do nothing",entity.id,actual);
        }
    }
    @Transactional(readOnly=true)
    public List<Object> history() {actor.admin();return jobs.findTop30ByOrderByCreatedAtDesc().stream().map(this::summary).toList();}
    @Transactional(readOnly=true)
    public Object detail(UUID id) {actor.admin();return jobs.findById(id).orElseThrow(ApiException::missing);}
    private Object summary(CareerImportJobEntity job) {return Map.of("id",job.id,"filename",job.filename,"status",job.status,"checksum",job.checksum,"createdAt",job.createdAt,"rows",job.rows.size(),"changes",job.changes.size());}
    @Transactional
    public Object revert(UUID id) {
        var user=actor.admin();jdbc.execute("select pg_advisory_xact_lock(74310501)");var job=jobs.lockById(id).orElseThrow(ApiException::missing);
        if(job.status.equals("REVERTED"))return summary(job);
        if(!job.status.equals("COMMITTED"))throw ApiException.invalid("Chỉ có thể hoàn tác lần nhập đã áp dụng.");
        supplements.revert(job.supplements);
        for(var c:job.changes) {var entity=careers.findById(c.path("id").asText()).orElseThrow(ApiException::missing);if(entity.revision!=c.path("appliedRevision").asLong())throw new ApiException(org.springframework.http.HttpStatus.CONFLICT,"Nghề đã được sửa sau lần nhập này. Không thể tự động hoàn tác.");
            if(c.path("before").isNull())entity.published=false;else {entity.data=c.path("before").deepCopy();entity.published=c.path("beforePublished").asBoolean();}
            careers.saveAndFlush(entity);syncLinks(entity);
        }
        job.status="REVERTED";jobs.save(job);audit.record(user.id,"CAREERS_IMPORT_REVERTED",id);return summary(job);
    }
}
