package vn.edu.huongnghiep.modules.careers;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.modules.admissions.ProgramService;
import vn.edu.huongnghiep.shared.ApiException;

@Service
public class CatalogSupplementService {
    public static final Map<String,List<String>> GROUPS=Map.of("A00",List.of("toan","ly","hoa"),"A01",List.of("toan","ly","anh"),"A02",List.of("toan","ly","sinh"),"B00",List.of("toan","hoa","sinh"),"D01",List.of("toan","van","anh"),"D07",List.of("toan","hoa","anh"),"C00",List.of("van","su","dia"),"X06",List.of("toan","ly","tin"));
    private final ProgramRepository programs;private final JdbcTemplate jdbc;private final ObjectMapper mapper;
    private final vn.edu.huongnghiep.modules.admissions.SchoolService schools;
    public CatalogSupplementService(ProgramRepository programs,JdbcTemplate jdbc,ObjectMapper mapper,vn.edu.huongnghiep.modules.admissions.SchoolService schools) {this.programs=programs;this.jdbc=jdbc;this.mapper=mapper;this.schools=schools;}
    public static UUID programId(String key) {try{return UUID.fromString(key);}catch(Exception e){return UUID.nameUUIDFromBytes(("program:"+key).getBytes(StandardCharsets.UTF_8));}}
    private static int year(String value) {try {int y=Integer.parseInt(value);if(y<2000||y>2099)throw new Exception();return y;}catch(Exception e){throw ApiException.invalid("Năm phải từ 2000 đến 2099.");}}
    private static boolean bool(String value) {if(!Set.of("TRUE","FALSE").contains(value))throw ApiException.invalid("Giá trị logic phải là TRUE hoặc FALSE.");return value.equals("TRUE");}
    private static String required(Map<String,String> row,String key) {String value=row.getOrDefault(key,"");if(value.isBlank()||value.length()>255)throw ApiException.invalid("Thiếu hoặc sai trường "+key);return value;}
    public JsonNode plan(CatalogSupplementReader.Data data,Set<String> codes,List<CareerWorkbookReader.Issue> errors) {
        ObjectNode result=mapper.createObjectNode();result.set("data",mapper.valueToTree(data));ObjectNode revisions=result.putObject("programRevisions");ObjectNode majorBefore=result.putObject("majorBefore");
        Map<String,Map<String,String>> majors=new HashMap<>();Set<String> names=new HashSet<>(),links=new HashSet<>(),keys=new HashSet<>(),benchmarks=new HashSet<>();Map<String,Map<String,String>> programRows=new HashMap<>();Map<String,BigDecimal> annualCutoffs=new HashMap<>();
        for(var row:data.majors())try {
            String key=required(row,"major_key"),name=required(row,"major_name");if(key.length()>100||majors.putIfAbsent(key,row)!=null||!names.add(CareerWorkbookReader.key(name)))throw ApiException.invalid("Mã/tên ngành bị trùng trong sheet.");
            year(row.get("data_year"));boolean verified=bool(row.get("verified"));if(verified && (!CareerWorkbookReader.validUrl(row.get("source_url"))||row.get("major_code").isBlank()))throw ApiException.invalid("Ngành xác minh cần mã chính thức và nguồn URL.");
            if(!row.get("source_url").isBlank()&&!CareerWorkbookReader.validUrl(row.get("source_url")))throw ApiException.invalid("Nguồn ngành không hợp lệ.");
            var existing=jdbc.queryForList("select id,name,external_key,official_code,verified,source_url,data_year from majors where external_key=? or normalized_name=?",key,CareerWorkbookReader.key(name));
            if(existing.size()>1)throw ApiException.invalid("Mã và tên ngành đang trỏ đến hai bản ghi khác nhau.");
            if(!existing.isEmpty() && existing.getFirst().get("external_key")!=null && !key.equals(existing.getFirst().get("external_key")))throw ApiException.invalid("Tên ngành đã có mã nội bộ khác. Dùng mã đang có trong bản xuất Excel.");
            majorBefore.set(key,mapper.valueToTree(existing));
        }catch(Exception e){errors.add(issue(row,"NGANH_DAO_TAO",e));}
        for(var row:data.links())try {String code=required(row,"onet_soc_code"),key=required(row,"major_key");if(!codes.contains(code)||!majors.containsKey(key))throw ApiException.invalid("Liên kết trỏ đến nghề/ngành không có trong workbook.");if(!links.add(code+":"+key))throw ApiException.invalid("Cặp nghề–ngành bị trùng.");}catch(Exception e){errors.add(issue(row,"LIEN_KET_NGHE_NGANH",e));}
        for(var row:data.programs())try {
            String key=required(row,"program_key");if(!keys.add(key))throw ApiException.invalid("program_key bị trùng.");programRows.put(key,row);
            required(row,"school");if(required(row,"short_name").length()>100||required(row,"program_code").length()>30)throw ApiException.invalid("Tên viết tắt tối đa 100, mã chương trình tối đa 30 ký tự.");int y=year(row.get("admission_year"));
            if(!majors.containsKey(row.get("major_key")))throw ApiException.invalid("major_key không có trong NGANH_DAO_TAO.");
            if(!"THPT".equals(row.get("method"))||!"30".equals(row.get("scale"))||!"THPT_STANDARD_30".equals(row.get("formula")))throw ApiException.invalid("Mẫu v1 chỉ tính chương trình THPT thang 30, tổng 3 môn không hệ số. Không nhập công thức khác vào đây.");
            var groups=Arrays.asList(row.get("subject_groups").split(";"));if(groups.isEmpty()||groups.stream().anyMatch(g->!GROUPS.containsKey(g.strip()))||new HashSet<>(groups).size()!=groups.size())throw ApiException.invalid("Tổ hợp sai hoặc bị trùng.");
            if(!CareerWorkbookReader.validUrl(row.get("source_url")))throw ApiException.invalid("Chương trình cần nguồn chính thức HTTP/HTTPS.");bool(row.get("published"));bool(row.get("verified"));
            var old=programs.findById(programId(key)).orElse(null);revisions.put(key,old==null?-1:old.revision);
        }catch(Exception e){errors.add(issue(row,"CHUONG_TRINH",e));}
        for(var row:data.benchmarks())try {
            var p=programRows.get(row.get("program_key"));if(p==null)throw ApiException.invalid("program_key không có trong CHUONG_TRINH.");
            int y=year(row.get("benchmark_year"));if(y>year(p.get("admission_year")))throw ApiException.invalid("Điểm chuẩn không được sau năm tuyển sinh.");
            String group=row.get("subject_group");if(Arrays.stream(p.get("subject_groups").split(";")).noneMatch(g->g.strip().equals(group)))throw ApiException.invalid("Tổ hợp điểm chuẩn không thuộc chương trình.");
            if(!"THPT".equals(row.get("method"))||!"30".equals(row.get("scale")))throw ApiException.invalid("Điểm chuẩn chỉ nhận THPT thang 30 cho mẫu v1.");
            BigDecimal score=new BigDecimal(row.get("benchmark"));if(score.signum()<0||score.compareTo(new BigDecimal("30"))>0||score.scale()>2)throw ApiException.invalid("Điểm chuẩn từ 0–30, tối đa 2 số thập phân; dùng dấu chấm.");
            if(y==year(p.get("admission_year"))){String k=row.get("program_key")+":"+y;var other=annualCutoffs.putIfAbsent(k,score);if(other!=null&&other.compareTo(score)!=0)throw ApiException.invalid("Mẫu v1 chưa hỗ trợ điểm chuẩn cùng năm khác nhau theo tổ hợp.");}
            if(!CareerWorkbookReader.validUrl(row.get("source_url")))throw ApiException.invalid("Điểm chuẩn cần đường dẫn nguồn.");bool(row.get("verified"));bool(row.get("comparable"));
            if(!benchmarks.add(row.get("program_key")+":"+y+":"+group))throw ApiException.invalid("Điểm chuẩn trùng chương trình/năm/tổ hợp.");
        }catch(Exception e){errors.add(issue(row,"DIEM_CHUAN",e));}
        return result;
    }
    private static CareerWorkbookReader.Issue issue(Map<String,String> row,String sheet,Exception e) {return new CareerWorkbookReader.Issue(Integer.parseInt(row.getOrDefault("_row","2")),sheet,e instanceof ApiException?e.getMessage():"Sai định dạng hoặc thiếu thông tin.");}
    public JsonNode apply(JsonNode plan) {
        var data=mapper.convertValue(plan.path("data"),CatalogSupplementReader.Data.class);ObjectNode changes=mapper.createObjectNode();ArrayNode programChanges=changes.putArray("programs");ArrayNode majorChanges=changes.putArray("majors");
        for(var row:data.majors()) {
            String name=row.get("major_name"),key=row.get("major_key");var now=jdbc.queryForList("select id,name,external_key,official_code,verified,source_url,data_year from majors where external_key=? or normalized_name=?",key,CareerWorkbookReader.key(name));
            if(!mapper.valueToTree(now).equals(plan.path("majorBefore").path(key)))throw new ApiException(org.springframework.http.HttpStatus.CONFLICT,"Ngành đã thay đổi sau lúc xem trước: "+key);
            UUID id=now.isEmpty()?UUID.nameUUIDFromBytes(("major:"+CareerWorkbookReader.key(name)).getBytes(StandardCharsets.UTF_8)):(UUID)now.getFirst().get("id");
            jdbc.update("insert into majors(id,name,normalized_name,external_key,official_code,verified,source_url,data_year) values(?,?,?,?,?,?,?,?) on conflict(id) do update set name=excluded.name,normalized_name=excluded.normalized_name,external_key=excluded.external_key,official_code=excluded.official_code,verified=excluded.verified,source_url=excluded.source_url,data_year=excluded.data_year",id,name,CareerWorkbookReader.key(name),key,row.get("major_code").isBlank()?null:row.get("major_code"),bool(row.get("verified")),row.get("source_url"),year(row.get("data_year")));
            var change=majorChanges.addObject();change.put("id",id.toString());change.set("before",mapper.valueToTree(now));change.set("after",mapper.valueToTree(jdbc.queryForList("select id,name,external_key,official_code,verified,source_url,data_year from majors where id=?",id)));
        }
        for(var row:data.programs()) {
            UUID id=programId(row.get("program_key"));var p=programs.findById(id).orElse(null);
            if((p==null?-1:p.revision)!=plan.path("programRevisions").path(row.get("program_key")).asLong())throw new ApiException(org.springframework.http.HttpStatus.CONFLICT,"Chương trình đã đổi sau lúc xem trước.");
            ObjectNode change=mapper.createObjectNode();change.put("id",id.toString());change.set("before",mapper.valueToTree(p));
            if(p==null){p=new ProgramEntity();p.id=id;p.hollandProfile=mapper.createObjectNode();}
            var major=jdbc.queryForMap("select id,name,official_code from majors where external_key=?",row.get("major_key"));
            var previous=change.path("before");
            boolean contextChanged=!previous.isNull()&&(!Objects.equals(p.majorId,major.get("id"))||p.admissionYear!=year(row.get("admission_year"))) ;
            var previousGroups=p.subjectGroups;
            p.school=row.get("school");p.shortName=row.get("short_name");p.major=(String)major.get("name");p.majorCode=major.get("official_code")==null?row.get("program_code"):(String)major.get("official_code");p.majorId=(UUID)major.get("id");p.admissionYear=year(row.get("admission_year"));
            var school=schools.ensure(p.shortName,p.school);p.schoolId=school.id;p.school=school.name;p.shortName=school.code;
            p.subjectGroups=mapper.valueToTree(Arrays.stream(row.get("subject_groups").split(";")).map(String::strip).map(g->new ProgramService.SubjectGroup(g,GROUPS.get(g))).toList());
            p.sourceUrl=row.get("source_url");p.verified=bool(row.get("verified"));p.published=bool(row.get("published"));
            contextChanged=contextChanged||(!previous.isNull()&&!Objects.equals(previousGroups,p.subjectGroups));
            ObjectNode details=p.admissionDetails instanceof ObjectNode existing?existing.deepCopy():mapper.createObjectNode();details.put("programKey",row.get("program_key"));details.put("programCode",row.get("program_code"));details.put("method","THPT");details.put("scale",30);details.put("formula","THPT_STANDARD_30");details.put("sourceUrl",row.get("source_url"));
            p.admissionDetails=details;
            if(row.containsKey("criteria"))details.put("secondaryCriteria",row.get("criteria"));
            details.put("importedAt",java.time.Instant.now().toString());
            ArrayNode history=p.benchmarkHistory==null?mapper.createArrayNode():p.benchmarkHistory.deepCopy();
            if(contextChanged)for(var point:history)if(point instanceof ObjectNode object)object.put("comparable",false);
            for(var benchmark:data.benchmarks())if(benchmark.get("program_key").equals(row.get("program_key"))) {
                int y=year(benchmark.get("benchmark_year"));BigDecimal score=new BigDecimal(benchmark.get("benchmark"));
                if(y==p.admissionYear) {p.benchmark=score;p.benchmarkYear=y;details.put("benchmarkSourceUrl",benchmark.get("source_url"));details.put("benchmarkVerified",bool(benchmark.get("verified")));continue;}
                for(int i=history.size()-1;i>=0;i--)if(history.get(i).path("year").asInt()==y&&history.get(i).path("group").asText().equals(benchmark.get("subject_group")))history.remove(i);
                ObjectNode point=history.addObject();point.put("year",y);point.put("group",benchmark.get("subject_group"));point.put("score",score.doubleValue());point.put("sourceUrl",benchmark.get("source_url"));point.put("verified",bool(benchmark.get("verified")));point.put("comparable",bool(benchmark.get("comparable")));
            }
            p.benchmarkHistory=history;programs.saveAndFlush(p);change.put("appliedRevision",p.revision);programChanges.add(change);
        }
        return changes;
    }
    public void revert(JsonNode plan) {
        for(var change:plan.path("applied").path("programs")) {
            var p=programs.findById(UUID.fromString(change.path("id").asText())).orElseThrow(ApiException::missing);if(p.revision!=change.path("appliedRevision").asLong())throw new ApiException(org.springframework.http.HttpStatus.CONFLICT,"Chương trình đã sửa sau lần nhập, không thể tự động hoàn tác.");
            if(change.path("before").isNull())p.published=false;else {var before=mapper.convertValue(change.path("before"),ProgramEntity.class);before.revision=p.revision;programs.saveAndFlush(before);continue;}programs.saveAndFlush(p);
        }
        for(var change:plan.path("applied").path("majors")) {
            UUID id=UUID.fromString(change.path("id").asText());var current=jdbc.queryForList("select id,name,external_key,official_code,verified,source_url,data_year from majors where id=?",id);
            if(!mapper.valueToTree(current).equals(change.path("after")))throw new ApiException(org.springframework.http.HttpStatus.CONFLICT,"Ngành đã được cập nhật sau lần nhập. Không thể tự động hoàn tác.");
            var before=change.path("before");
            if(before.isEmpty())jdbc.update("update majors set external_key=null,official_code=null,verified=false,source_url=null,data_year=null where id=?",id);
            else {var b=before.get(0);jdbc.update("update majors set name=?,normalized_name=?,external_key=?,official_code=?,verified=?,source_url=?,data_year=? where id=?",b.path("name").asText(),CareerWorkbookReader.key(b.path("name").asText()),nullable(b,"external_key"),nullable(b,"official_code"),b.path("verified").asBoolean(),nullable(b,"source_url"),b.path("data_year").isNull()?null:b.path("data_year").asInt(),id);}
        }
    }
    private static String nullable(JsonNode node,String field){return node.path(field).isNull()?null:node.path(field).asText();}
}
