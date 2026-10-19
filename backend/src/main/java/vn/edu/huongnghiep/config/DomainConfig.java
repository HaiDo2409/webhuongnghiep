package vn.edu.huongnghiep.config;
import org.springframework.context.annotation.*;
import vn.edu.huongnghiep.modules.quizzes.domain.*;

@Configuration
public class DomainConfig {
    @Bean HollandScoringStrategy hollandScoringStrategy() { return new HollandScoringStrategy(); }
    @Bean MIScoringStrategy miScoringStrategy() { return new MIScoringStrategy(); }
    @Bean ScoringRegistry scoringRegistry(java.util.List<QuizScoringStrategy> strategies) { return new ScoringRegistry(strategies); }
}
