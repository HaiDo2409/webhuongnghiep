package vn.edu.huongnghiep.modules.admissions;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import vn.edu.huongnghiep.shared.ApiException;
@RestController
public class SchoolDirectoryController {
 private final ProgramService programs;private final SchoolService schools;
 public SchoolDirectoryController(ProgramService programs,SchoolService schools){this.programs=programs;this.schools=schools;}
 private String code(ProgramService.ProgramDto p){return p.admissionDetails()!=null?p.admissionDetails().path("schoolCode").asText(p.shortName()).toUpperCase(Locale.ROOT):p.shortName().toUpperCase(Locale.ROOT);}
 @GetMapping("/api/schools") public Object schools(){return schools.list(false).stream().map(s->Map.of("id",s.id(),"code",s.code(),"name",s.name(),"programCount",s.publicProgramCount(),"years",s.years())).toList();}
 @GetMapping("/api/schools/{code}/programs") public Object school(@PathVariable String code){var school=schools.publicSchool(code);var values=programs.list(false).stream().filter(p->school.id.equals(p.schoolId())||p.schoolId()==null&&code(p).equalsIgnoreCase(code)).sorted(Comparator.comparing(ProgramService.ProgramDto::major)).toList();return Map.of("code",school.code,"name",school.name,"programs",values);}
}
