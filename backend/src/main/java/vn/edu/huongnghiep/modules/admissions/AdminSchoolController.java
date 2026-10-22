package vn.edu.huongnghiep.modules.admissions;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/admin/schools")
public class AdminSchoolController {
 private final SchoolService schools;
 public AdminSchoolController(SchoolService schools){this.schools=schools;}
 @GetMapping Object list(){return schools.list(true);}
 @PostMapping Object create(@RequestBody SchoolService.Input input){return schools.save(null,input);}
 @PutMapping("/{id}") Object update(@PathVariable UUID id,@RequestBody SchoolService.Input input){return schools.save(id,input);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) void delete(@PathVariable UUID id,@RequestParam long revision){schools.delete(id,revision);}
}
