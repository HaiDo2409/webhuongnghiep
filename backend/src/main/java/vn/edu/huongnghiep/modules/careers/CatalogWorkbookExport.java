package vn.edu.huongnghiep.modules.careers;
import com.fasterxml.jackson.databind.JsonNode;
import java.io.*;
import java.util.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.modules.auth.CurrentActor;

@Service
public class CatalogWorkbookExport {
    public static final List<String> CAREER_HEADERS=List.of("onet_soc_code","holland_code","job_title_en","job_title_vi","description_vi","vn_university_majors","career_groups","stem_groups","skills_vi","salary_min_vnd","salary_max_vnd","salary_period","salary_region","salary_year","salary_source_url","outlook_vi","outlook_region","outlook_year","outlook_source_url","source_url","data_year","published");
    private final CurrentActor actor;private final CareerRepository careers;private final ProgramRepository programs;private final JdbcTemplate jdbc;
    public CatalogWorkbookExport(CurrentActor actor,CareerRepository careers,ProgramRepository programs,JdbcTemplate jdbc){this.actor=actor;this.careers=careers;this.programs=programs;this.jdbc=jdbc;}
    @Transactional(readOnly=true)
    public byte[] export() throws IOException {
        actor.admin();try(var wb=new XSSFWorkbook();var output=new ByteArrayOutputStream()) {
            var careerSheet=sheet(wb,"NGHE_NGHIEP",CAREER_HEADERS);
            for(var career:careers.findByPublishedTrue()) {var d=career.data;var row=careerSheet.createRow(careerSheet.getLastRowNum()+1);List<Object> values=Arrays.asList(career.onetCode,d.path("hollandCode").asText(),d.path("nameEn").asText(),d.path("nameVi").asText(),d.path("description").asText(),join(d.path("majorNames")),groups(d.path("groups")),join(d.path("stemGroups")),join(d.path("skills")),number(d,"salaryMinVnd"),number(d,"salaryMaxVnd"),d.path("salaryPeriod").asText(),d.path("salaryRegion").asText(),number(d,"salaryYear"),d.path("salarySourceUrl").asText(),d.path("outlook").asText(),d.path("outlookRegion").asText(),number(d,"outlookYear"),d.path("outlookSourceUrl").asText(),d.path("sourceUrl").asText(),number(d,"dataYear"),"TRUE");write(row,values);}
            var majorSheet=sheet(wb,"NGANH_DAO_TAO",List.of("major_key","major_name","major_code","source_url","data_year","verified"));Map<UUID,String> keys=new HashMap<>();
            for(var m:jdbc.queryForList("select * from majors order by name")) {String key=m.get("external_key")==null?"major-"+m.get("id"):m.get("external_key").toString();keys.put((UUID)m.get("id"),key);write(majorSheet.createRow(majorSheet.getLastRowNum()+1),Arrays.asList(key,m.get("name"),m.get("official_code"),m.get("source_url"),m.get("data_year")==null?2026:m.get("data_year"),Boolean.TRUE.equals(m.get("verified"))?"TRUE":"FALSE"));}
            var linkSheet=sheet(wb,"LIEN_KET_NGHE_NGANH",List.of("onet_soc_code","major_key"));
            for(var link:jdbc.queryForList("select c.onet_code,l.major_id from career_major_links l join careers c on c.id=l.career_id where c.published and c.onet_code is not null"))write(linkSheet.createRow(linkSheet.getLastRowNum()+1),List.of(link.get("onet_code"),keys.get(link.get("major_id"))));
            var programSheet=sheet(wb,"CHUONG_TRINH",List.of("program_key","school","short_name","program_code","major_key","admission_year","subject_groups","method","scale","formula","source_url","verified","published"));
            var benchmarkSheet=sheet(wb,"DIEM_CHUAN",List.of("program_key","benchmark_year","subject_group","method","scale","benchmark","source_url","verified","comparable"));
            for(var p:programs.findAll()) {if(p.majorId==null||!keys.containsKey(p.majorId)||!CareerWorkbookReader.validUrl(p.sourceUrl)||p.admissionDetails.path("calculationSupported").isBoolean()&&!p.admissionDetails.path("calculationSupported").asBoolean()||p.subjectGroups.isEmpty())continue;String key=p.id.toString();String groups=String.join(";",java.util.stream.StreamSupport.stream(p.subjectGroups.spliterator(),false).map(g->g.path("code").asText()).toList());
                write(programSheet.createRow(programSheet.getLastRowNum()+1),List.of(key,p.school,p.shortName,p.admissionDetails.path("programCode").asText(p.majorCode),keys.get(p.majorId),p.admissionYear,groups,"THPT",30,"THPT_STANDARD_30",p.sourceUrl==null?"":p.sourceUrl,p.verified?"TRUE":"FALSE",p.published?"TRUE":"FALSE"));
                for(var point:p.benchmarkHistory)write(benchmarkSheet.createRow(benchmarkSheet.getLastRowNum()+1),List.of(key,point.path("year").asInt(),point.path("group").asText(),"THPT",30,point.path("score").decimalValue(),point.path("sourceUrl").asText(),point.path("verified").asBoolean()?"TRUE":"FALSE",point.path("comparable").asBoolean()?"TRUE":"FALSE"));
                if(p.benchmark!=null&&p.benchmarkYear!=null)for(var g:p.subjectGroups)write(benchmarkSheet.createRow(benchmarkSheet.getLastRowNum()+1),List.of(key,p.benchmarkYear,g.path("code").asText(),"THPT",30,p.benchmark,p.admissionDetails.path("benchmarkSourceUrl").asText(p.sourceUrl),p.verified?"TRUE":"FALSE","FALSE"));
            }
            var guide=sheet(wb,"HUONG_DAN",List.of("Quy tắc","Nội dung"));write(guide.createRow(1),List.of("Schema","STEM_COMPASS_CATALOG_V1; dòng 1 là tiêu đề; mã giữ dạng văn bản; không công thức."));write(guide.createRow(2),List.of("Cập nhật","Mã giữ nguyên để cập nhật; ô tùy chọn trống giữ giá trị cũ; dòng vắng không bị xóa; preview trước khi xác nhận."));write(guide.createRow(3),List.of("Tuyển sinh","Chỉ THPT thang 30 tổng ba môn. Mỗi chương trình/năm/tổ hợp là một dòng điểm chuẩn, nguồn riêng. Không đưa HSA/IELTS vào sheet điểm chuẩn THPT."));
            var sourceSheet=sheet(wb,"DIEM_TU_FILE",List.of("program_id","Trường","Ngành / chương trình","Công thức THPT","THPT 2024","THPT 2025","THPT 2026","TSA 2026","HSA 2026","SPT 2026","V-ACT 2026","Dòng nguồn","File nguồn"));
            for(var p:programs.findAll())if(p.admissionDetails.has("workbook")) {
                var source=p.admissionDetails.path("workbook");List<Object> values=new ArrayList<>(List.of(p.id.toString(),p.school,p.major,source.path("formula").asText()));
                for(var cutoff:source.path("cutoffs"))values.add(cutoff.hasNonNull("score")?cutoff.path("score").numberValue():cutoff.path("raw").asText());
                values.add(source.path("sourceRow").asInt());values.add(source.path("sourceFile").asText());write(sourceSheet.createRow(sourceSheet.getLastRowNum()+1),values);
            }
            write(guide.createRow(4),List.of("Điểm từ file","DIEM_TU_FILE chứa đầy đủ điểm gốc và công thức theo từng phương thức để xem/đối chiếu. Sheet này chưa nhập ngược bằng mẫu v1. CHUONG_TRINH/DIEM_CHUAN chỉ xuất các dòng THPT thang 30 có nguồn URL phù hợp; dữ liệu khác vẫn giữ trong database và DIEM_TU_FILE."));
            wb.write(output);return output.toByteArray();
        }
    }
    private static Object number(JsonNode n,String key){return n.hasNonNull(key)?n.path(key).numberValue():null;}
    private static String join(JsonNode node){return String.join(";",java.util.stream.StreamSupport.stream(node.spliterator(),false).map(JsonNode::asText).toList());}
    private static String groups(JsonNode node){return String.join(";",java.util.stream.StreamSupport.stream(node.spliterator(),false).map(v->v.path("name").asText()).toList());}
    private static Sheet sheet(Workbook wb,String name,List<String> headers){var sheet=wb.createSheet(name);var row=sheet.createRow(0);write(row,new ArrayList<>(headers));sheet.createFreezePane(0,1);for(int i=0;i<headers.size();i++)sheet.setColumnWidth(i,Math.min(60,Math.max(20,headers.get(i).length()+3))*256);return sheet;}
    private static void write(Row row,List<?> values){for(int i=0;i<values.size();i++){var cell=row.createCell(i);Object value=values.get(i);if(value instanceof Number n)cell.setCellValue(n.doubleValue());else if(value!=null)cell.setCellValue(value.toString());}}
}
