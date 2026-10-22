package vn.edu.huongnghiep.modules.admissions;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.modules.auth.CurrentActor;

@RestController
public class SchoolScoreController {
    private final SchoolScoreCalculator calculator=new SchoolScoreCalculator();
    private final CurrentActor actor;
    private final RecommendationRunRepository runs;
    private final ObjectMapper mapper;
    public SchoolScoreController(CurrentActor actor,RecommendationRunRepository runs,ObjectMapper mapper) { this.actor=actor;this.runs=runs;this.mapper=mapper; }
    @GetMapping("/api/admissions/policies") Object policies() { return SchoolScoreCalculator.POLICIES; }
    @PostMapping("/api/admissions/calculate")
    @Transactional
    public Object calculate(@Valid @RequestBody SchoolScoreCalculator.Input input) {
        var result=calculator.calculate(input);var user=actor.optional();
        if(user!=null) {
            var run=new RecommendationRunEntity();run.id=UUID.randomUUID();run.userId=user.id;run.inputSnapshot=mapper.valueToTree(input);
            run.resultSnapshot=mapper.valueToTree(result);run.algorithmVersion="school-score-2026-v1";run.createdAt=Instant.now();runs.save(run);
        }
        return result;
    }
}
