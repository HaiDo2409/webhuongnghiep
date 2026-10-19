package vn.edu.huongnghiep.modules.quizzes;
import java.util.UUID;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
public class QuizController {
    private final QuizService service;
    public QuizController(QuizService service) { this.service=service; }
    @GetMapping("/api/quizzes") Object list(HttpSession session) {
        var quizzes=service.published();
        quizzes.forEach(q->session.setAttribute("quiz-version-"+q.type(),q.id().toString())); return quizzes;
    }
    @PostMapping("/api/quiz-results") Object submit(@Valid @RequestBody QuizService.SubmitRequest request, HttpSession session) { return service.submit(request,session); }
    @GetMapping("/api/me/quiz-results") Object history() { return service.history(); }
    @PostMapping("/api/me/quiz-results/claim") void claim(HttpSession session) { service.claim(session); }
    @GetMapping("/api/admin/quizzes") Object adminList() { return service.adminList(); }
    @PostMapping("/api/admin/quizzes") Object draft(@Valid @RequestBody QuizService.DraftRequest request) { return service.draft(request); }
    public record PublishRequest(long revision) {}
    @PostMapping("/api/admin/quizzes/{id}/publish") Object publish(@PathVariable UUID id,@RequestBody PublishRequest request) { return service.publish(id,request.revision()); }
}
