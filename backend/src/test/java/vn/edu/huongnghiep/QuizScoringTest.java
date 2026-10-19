package vn.edu.huongnghiep;

import java.util.*;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;
import vn.edu.huongnghiep.modules.quizzes.domain.*;
import vn.edu.huongnghiep.shared.ApiException;

class QuizScoringTest {
    private final QuizScoringStrategy holland=new HollandScoringStrategy();
    private List<QuizQuestion> questions(QuizScoringStrategy strategy) {
        List<QuizQuestion> items=new ArrayList<>();int id=1;
        for(String dimension:strategy.dimensions()) items.add(new QuizQuestion(id++,"Câu hỏi "+dimension,dimension));
        return items;
    }
    @Test void normalizesUsingActualQuestionCounts() {
        var questions=new ArrayList<>(questions(holland));questions.add(new QuizQuestion(7,"Câu R bổ sung","R"));
        var answers=new HashMap<Integer,Integer>();questions.forEach(q->answers.put(q.id(),q.type().equals("R")?5:1));
        var result=holland.score(questions,answers);
        assertThat(result.scores().get("R")).isEqualTo(10);
        assertThat(result.normalizedScores().get("R")).isEqualTo(100);
        assertThat(result.normalizedScores().get("I")).isZero();
        assertThat(result.topCodes()).startsWith("R");
    }
    @Test void rejectsMissingExtraAndOutOfRangeAnswers() {
        var questions=questions(holland);
        assertThatThrownBy(()->holland.score(questions,Map.of(1,5))).isInstanceOf(ApiException.class);
        var answers=new HashMap<Integer,Integer>();questions.forEach(q->answers.put(q.id(),3));
        answers.put(1,6);assertThatThrownBy(()->holland.score(questions,answers)).isInstanceOf(ApiException.class);
        answers.put(1,3);answers.put(99,3);assertThatThrownBy(()->holland.score(questions,answers)).isInstanceOf(ApiException.class);
    }
    @Test void rejectsDuplicateIdsAndIncompleteDimensions() {
        var questions=new ArrayList<>(questions(holland));questions.add(questions.getFirst());
        assertThatThrownBy(()->holland.validate(questions)).isInstanceOf(ApiException.class);
        assertThatThrownBy(()->holland.validate(List.of(new QuizQuestion(1,"R","R")))).isInstanceOf(ApiException.class);
    }
    @Test void supportsEightMIDimensions() {
        var mi=new MIScoringStrategy();var questions=questions(mi);var answers=new HashMap<Integer,Integer>();
        questions.forEach(q->answers.put(q.id(),3));
        assertThat(mi.score(questions,answers).normalizedScores()).hasSize(8).allSatisfy((key,value)->assertThat(value).isEqualTo(50));
    }
}
