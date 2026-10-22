package vn.edu.huongnghiep.modules.careers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.modules.auth.CurrentActor;
import vn.edu.huongnghiep.shared.*;

@RestController
@RequestMapping("/api/admin/careers")
public class AdminCareerController {
    private final CareerRepository careers;
    private final JdbcTemplate jdbc; private final CurrentActor actor; private final CareerImportService imports;
    private final CareerCatalogService catalog; private final ObjectMapper mapper; private final AuditService audit;
    public AdminCareerController(CareerRepository careers,JdbcTemplate jdbc,CurrentActor actor,CareerImportService imports,CareerCatalogService catalog,ObjectMapper mapper,AuditService audit) {
        this.careers=careers;this.jdbc=jdbc;this.actor=actor;this.imports=imports;this.catalog=catalog;this.mapper=mapper;this.audit=audit;
    }
    public record Input(String id,Long revision,String onetCode,String hollandCode,String nameEn,String nameVi,String description,List<String> groups,List<String> stemGroups,boolean published) {}
    @GetMapping @Transactional(readOnly=true)
    public Object list(@RequestParam(defaultValue="") String q,@RequestParam(defaultValue="0") int page) {
        actor.admin();if(page<0||page>100000)throw ApiException.invalid("Trang không hợp lệ.");String query=CareerCatalogService.searchKey(q);
        var all=careers.findAll().stream().filter(c->c.onetCode!=null).filter(c->CareerCatalogService.searchKey(c.onetCode+" "+c.data.path("nameVi").asText()+" "+c.data.path("nameEn").asText()).contains(query)).sorted(Comparator.comparing(c->c.data.path("nameVi").asText())).toList();
        return Map.of("total",all.size(),"items",all.subList(Math.min(all.size(),page*20),Math.min(all.size(),(page+1)*20)).stream().map(c->catalog.dto(c,null)).toList());
    }
    @GetMapping("/options") @Transactional(readOnly=true)
    public Object options() {
        actor.admin();return Map.of("groups",jdbc.queryForList("select id,name from career_groups order by name"));
    }
    @GetMapping("/{id}") @Transactional(readOnly=true)
    public Object detail(@PathVariable String id) {
        actor.admin();var c=careers.findById(id).orElseThrow(ApiException::missing);var node=catalog.dto(c,null);
        return node;
    }
    private String text(String value,int max,String label) {if(value==null||value.isBlank()||value.strip().length()>max)throw ApiException.invalid(label+" không được trống, tối đa "+max+" ký tự.");return value.strip();}
    @PostMapping @Transactional
    public Object save(@RequestBody Input input) {
        var admin=actor.admin();jdbc.execute("select pg_advisory_xact_lock(74310501)");
        var c=input.id()==null||input.id().isBlank()?null:careers.findById(input.id()).orElseThrow(ApiException::missing);
        if(c!=null&&(input.revision()==null||input.revision()!=c.revision))throw new ApiException(HttpStatus.CONFLICT,"Nghề đã được sửa ở nơi khác. Hãy mở lại trước khi lưu.");
        String code=text(input.onetCode(),10,"Mã O*NET");if(!code.matches("\\d{2}-\\d{4}\\.\\d{2}"))throw ApiException.invalid("Mã O*NET cần dạng 15-1252.00.");
        if(c!=null&&!code.equals(c.onetCode))throw ApiException.invalid("Không đổi mã định danh của nghề đã có.");
        if(c==null&&careers.findByOnetCode(code).isPresent())throw new ApiException(HttpStatus.CONFLICT,"Mã nghề đã có. Hãy tìm và sửa bản hiện tại.");
        String holland=text(input.hollandCode(),6,"Mã Holland").toUpperCase(Locale.ROOT);if(!holland.matches("[RIASEC]{1,6}")||holland.chars().distinct().count()!=holland.length())throw ApiException.invalid("Holland gồm các chữ R/I/A/S/E/C, không lặp.");
        // Imported major descriptions remain informational; editing a career never requires manual links.
        List<String> names=new ArrayList<>();
        if(c!=null)c.data.path("majorNames").forEach(name->names.add(name.asText()));
        if(input.groups()==null||input.groups().isEmpty()||input.groups().size()>50)throw ApiException.invalid("Cần ít nhất một nhóm ngành (tối đa 50).");
        var groups=input.groups().stream().map(g->text(g,255,"Nhóm ngành")).distinct().toList();
        if(input.stemGroups()==null||input.stemGroups().isEmpty()||input.stemGroups().stream().anyMatch(g->!Set.of("S","T","E","M","OTHER").contains(g)))throw ApiException.invalid("Chọn lĩnh vực STEM hợp lệ.");
        var row=new CareerWorkbookReader.RowData(1,code,holland,text(input.nameEn(),255,"Tên tiếng Anh"),text(input.nameVi(),255,"Tên tiếng Việt"),text(input.description(),2000,"Mô tả"),names,groups,Map.of("stem_groups",String.join(";",input.stemGroups())));
        var data=imports.merge(row,c==null?null:c.data);data.put("programLinkMode","TAG");
        if(c!=null&&!holland.equals(c.data.path("hollandCode").asText())) {data.remove("interestProfile");data.put("interestProfileOverride",true);}
        boolean created=c==null;if(created){c=new CareerEntity();c.id="onet-"+code;c.onetCode=code;}
        c.data=data;c.published=input.published();careers.saveAndFlush(c);imports.syncLinks(c);
        audit.record(admin.id,created?"CAREER_CREATED":"CAREER_UPDATED",c.id);return detail(c.id);
    }
}
