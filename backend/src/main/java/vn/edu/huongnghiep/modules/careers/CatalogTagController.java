package vn.edu.huongnghiep.modules.careers;
import org.springframework.web.bind.annotation.*;
@RestController
public class CatalogTagController {
 private final CatalogTagService tags;private final TagProgramMatcher matcher;
 public CatalogTagController(CatalogTagService tags,TagProgramMatcher matcher){this.tags=tags;this.matcher=matcher;}
 @GetMapping("/api/admin/tags") Object list(){return tags.list();}
 @PostMapping("/api/admin/tags") Object save(@RequestBody CatalogTagService.TagInput input){return tags.save(input);}
 @GetMapping("/api/admin/tag-assignments") Object assignments(@RequestParam String type,@RequestParam String targetId){return tags.assignments(type,targetId);}
 @PostMapping("/api/admin/tag-assignments") Object assign(@RequestBody CatalogTagService.Assignment input){return tags.assign(input);}
 @GetMapping("/api/admin/careers/{id}/tag-matches") Object matches(@PathVariable String id){return matcher.candidates(id);}
 @PostMapping("/api/admin/careers/{id}/program-decisions") Object decide(@PathVariable String id,@RequestBody CatalogTagService.Decision input){return tags.decide(id,input);}
}
