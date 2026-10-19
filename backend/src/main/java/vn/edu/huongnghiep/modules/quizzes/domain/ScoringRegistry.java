package vn.edu.huongnghiep.modules.quizzes.domain;
import java.util.List;
import vn.edu.huongnghiep.shared.ApiException;

public class ScoringRegistry {
    private final List<QuizScoringStrategy> strategies;
    public ScoringRegistry(List<QuizScoringStrategy> strategies) { this.strategies = List.copyOf(strategies); }
    public QuizScoringStrategy get(String type) { return strategies.stream().filter(s -> s.type().equals(type)).findFirst().orElseThrow(() -> ApiException.invalid("Loại quiz chưa được hỗ trợ.")); }
}
