package vn.edu.huongnghiep.modules.admissions;
import org.springframework.web.bind.annotation.*;
import vn.edu.huongnghiep.infrastructure.persistence.CareerRepository;

@RestController
public class CareerController {
    private final CareerRepository careers;
    public CareerController(CareerRepository careers) {this.careers=careers;}
    @GetMapping("/api/careers") Object list() {return careers.findAll().stream().map(c->c.data).toList();}
}
