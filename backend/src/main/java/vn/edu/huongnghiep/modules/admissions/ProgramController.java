package vn.edu.huongnghiep.modules.admissions;
import java.util.UUID;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
public class ProgramController {
    private final ProgramService service;
    public ProgramController(ProgramService service) { this.service=service; }
    @GetMapping("/api/programs") Object list() { return service.list(false); }
    @GetMapping("/api/admin/programs") Object adminList() { return service.list(true); }
    @PostMapping("/api/admin/programs") Object create(@Valid @RequestBody ProgramService.ProgramRequest r) { return service.save(null,r); }
    @PutMapping("/api/admin/programs/{id}") Object update(@PathVariable UUID id,@Valid @RequestBody ProgramService.ProgramRequest r) { return service.save(id,r); }
}
