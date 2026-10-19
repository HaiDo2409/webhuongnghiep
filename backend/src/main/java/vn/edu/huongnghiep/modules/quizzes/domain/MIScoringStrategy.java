package vn.edu.huongnghiep.modules.quizzes.domain;
import java.util.List;

public class MIScoringStrategy implements QuizScoringStrategy {
    public String type() { return "MI"; }
    public List<String> dimensions() { return List.of("linguistic", "logical", "spatial", "musical", "bodily", "interpersonal", "intrapersonal", "naturalist"); }
}
