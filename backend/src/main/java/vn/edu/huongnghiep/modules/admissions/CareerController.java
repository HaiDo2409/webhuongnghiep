package vn.edu.huongnghiep.modules.admissions;
import org.springframework.web.bind.annotation.*;
import vn.edu.huongnghiep.infrastructure.persistence.CareerRepository;
import vn.edu.huongnghiep.modules.careers.CareerCatalogService;
import jakarta.servlet.http.HttpSession;
import java.util.UUID;

@RestController
public class CareerController {
    private final CareerRepository careers;
    private final CareerCatalogService catalog;
    public CareerController(CareerRepository careers,CareerCatalogService catalog) {this.careers=careers;this.catalog=catalog;}
    @GetMapping("/api/careers") Object list() {return careers.findAll().stream().map(c->c.data).toList();}
    @GetMapping("/api/career-catalog") Object search(@RequestParam(defaultValue="") String q,@RequestParam(required=false) String group,
        @RequestParam(required=false) String stem,@RequestParam(required=false) String skill,@RequestParam(required=false) Integer salary,
        @RequestParam(required=false) UUID quizResultId,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="24") int size,HttpSession session) {
        return catalog.search(q,group,stem,skill,salary,quizResultId,page,size,session);
    }
    @GetMapping("/api/career-catalog/{id}") Object detail(@PathVariable String id,@RequestParam(required=false) UUID quizResultId,HttpSession session) {return catalog.detail(id,quizResultId,session);}
}
