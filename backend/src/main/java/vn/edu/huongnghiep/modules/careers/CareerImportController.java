package vn.edu.huongnghiep.modules.careers;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;
@RestController
public class CareerImportController {
    private final CareerImportService imports;
    private final CatalogWorkbookExport exporter;private final vn.edu.huongnghiep.modules.auth.CurrentActor actor;
    public CareerImportController(CareerImportService imports,CatalogWorkbookExport exporter,vn.edu.huongnghiep.modules.auth.CurrentActor actor) {this.imports=imports;this.exporter=exporter;this.actor=actor;}
    @GetMapping("/api/admin/career-imports/template") Object template() {actor.admin();return org.springframework.http.ResponseEntity.ok().header("Content-Disposition","attachment; filename=STEM_Compass_catalog_v1.xlsx").contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).body(new org.springframework.core.io.ClassPathResource("templates/catalog-v1.xlsx"));}
    @GetMapping("/api/admin/career-imports/export") Object export() throws java.io.IOException {return org.springframework.http.ResponseEntity.ok().header("Content-Disposition","attachment; filename=STEM_Compass_catalog_export.xlsx").contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).body(exporter.export());}
    @PostMapping("/api/admin/career-imports/preview") Object preview(@RequestParam MultipartFile file,@RequestParam(required=false) String sheet) throws java.io.IOException {
        return imports.preview(file.getBytes(),file.getOriginalFilename()==null?"upload.xlsx":file.getOriginalFilename(),sheet);
    }
    @PostMapping("/api/admin/career-imports/{id}/commit") Object commit(@PathVariable UUID id) {return imports.commit(id);}
    @PostMapping("/api/admin/career-imports/{id}/revert") Object revert(@PathVariable UUID id) {return imports.revert(id);}
    @GetMapping("/api/admin/career-imports") Object history() {return imports.history();}
    @GetMapping("/api/admin/career-imports/{id}") Object detail(@PathVariable UUID id) {return imports.detail(id);}
}
