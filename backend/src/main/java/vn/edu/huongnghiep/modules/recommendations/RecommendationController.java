package vn.edu.huongnghiep.modules.recommendations;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
public class RecommendationController {
    private final RecommendationService service;
    public RecommendationController(RecommendationService service) { this.service=service; }
    @PostMapping({"/api/recommendations","/api/admissions/search"}) Object recommend(@Valid @RequestBody RecommendationService.Request r,HttpSession session) { return service.recommend(r,session); }
}
