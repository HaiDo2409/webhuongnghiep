package vn.edu.huongnghiep.modules.quizzes.domain;
import java.util.List;

public class HollandScoringStrategy implements QuizScoringStrategy {
    public String type() { return "HOLLAND"; }
    public List<String> dimensions() { return List.of("R", "I", "A", "S", "E", "C"); }
}
