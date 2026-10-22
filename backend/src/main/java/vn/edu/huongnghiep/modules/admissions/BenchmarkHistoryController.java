package vn.edu.huongnghiep.modules.admissions;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;
@RestController
public class BenchmarkHistoryController {
    private final BenchmarkHistoryService service;
    public BenchmarkHistoryController(BenchmarkHistoryService service) { this.service=service; }
    @GetMapping("/api/admin/programs/{id}/benchmarks") Object get(@PathVariable UUID id) { return service.get(id); }
    @PutMapping("/api/admin/programs/{id}/benchmarks") Object save(@PathVariable UUID id,@Valid @RequestBody BenchmarkHistoryService.Input input) { return service.save(id,input); }
}
