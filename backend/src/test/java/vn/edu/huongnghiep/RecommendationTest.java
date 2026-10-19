package vn.edu.huongnghiep;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.modules.auth.CurrentActor;
import vn.edu.huongnghiep.modules.admissions.*;
import vn.edu.huongnghiep.modules.recommendations.*;
import vn.edu.huongnghiep.shared.ApiException;

class RecommendationTest {
    private final ObjectMapper mapper=new ObjectMapper();
    private final ProgramService programs=mock(ProgramService.class);
    private final QuizResultRepository results=mock(QuizResultRepository.class);
    private final QuizVersionRepository versions=mock(QuizVersionRepository.class);
    private final RecommendationRunRepository runs=mock(RecommendationRunRepository.class);
    private final CurrentActor actor=mock(CurrentActor.class);
    private final RecommendationService service=new RecommendationService(programs,results,versions,runs,mapper,actor);
    private final Map<String,BigDecimal> scores=Map.of("toan",new BigDecimal("8.5"),"ly",new BigDecimal("8"),"hoa",new BigDecimal("9"));
    private ProgramService.ProgramDto program(String name,String dimension) {
        return new ProgramService.ProgramDto(UUID.randomUUID(),"Trường thử","TEST",name,"001",2026,
            List.of(new ProgramService.SubjectGroup("A00",List.of("toan","ly","hoa"))),Map.of(dimension,100.0),new BigDecimal("25"),2024,null,false,true,0);
    }
    private QuizResultEntity result(String dimension) {
        var r=new QuizResultEntity();r.id=UUID.randomUUID();r.quizVersionId=UUID.randomUUID();r.normalizedScores=mapper.valueToTree(Map.of(dimension,100.0));
        var q=new QuizVersionEntity();q.id=r.quizVersionId;q.quizType="HOLLAND";
        when(results.findById(r.id)).thenReturn(Optional.of(r));when(versions.findById(q.id)).thenReturn(Optional.of(q));return r;
    }
    @Test void quizChangesOrderButNeverChangesSubjectScores() {
        var research=program("Nghiên cứu","I");var technical=program("Kỹ thuật","R");
        when(programs.list(false)).thenReturn(List.of(research,technical));
        var session=new MockHttpSession();var r=result("I");session.setAttribute("quiz-result-HOLLAND",r.id.toString());
        var first=service.recommend(new RecommendationService.Request(2026,RecommendationService.Mode.COMBINED,r.id,scores),session);
        var other=result("R");session.setAttribute("quiz-result-HOLLAND",other.id.toString());
        var second=service.recommend(new RecommendationService.Request(2026,RecommendationService.Mode.COMBINED,other.id,scores),session);
        assertThat(first.items().getFirst().program().id()).isEqualTo(research.id());
        assertThat(second.items().getFirst().program().id()).isEqualTo(technical.id());
        assertThat(first.items()).allSatisfy(i->assertThat(i.rawScore()).isEqualByComparingTo("25.5"));
        assertThat(second.items()).allSatisfy(i->assertThat(i.rawScore()).isEqualByComparingTo("25.5"));
        verifyNoInteractions(runs);
    }
    @Test void cannotUseAnotherPersonsResult() {
        var r=result("I");r.userId=UUID.randomUUID();
        assertThatThrownBy(()->service.recommend(new RecommendationService.Request(2026,RecommendationService.Mode.INTEREST,r.id,scores),new MockHttpSession())).isInstanceOf(ApiException.class);
    }
    @Test void missingSubjectsAreNotTreatedAsZero() {
        when(programs.list(false)).thenReturn(List.of(program("Ngành","R")));
        var response=service.recommend(new RecommendationService.Request(2026,RecommendationService.Mode.POINTS,null,Map.of("toan",BigDecimal.TEN)),new MockHttpSession());
        assertThat(response.items().getFirst().rawScore()).isNull();
        assertThat(response.items().getFirst().rawDifference()).isNull();
    }
    @Test void zeroVectorsHaveNoCompatibilityRatherThanNaN() {
        var calc=new CompatibilityCalculator();assertThat(calc.compare(Map.of("R",0.0),Map.of("R",100.0))).isNull();
        assertThat(calc.compare(Map.of("R",100.0),Map.of("R",100.0))).isEqualTo(100);
    }
    @Test void optingOutDoesNotReadOrApplyAnyQuizResult() {
        when(programs.list(false)).thenReturn(List.of(program("Ngành","I")));
        var response=service.recommend(new RecommendationService.Request(2026,RecommendationService.Mode.POINTS,null,scores),new MockHttpSession());
        assertThat(response.items().getFirst().compatibility()).isNull();
        assertThat(response.items().getFirst().rawScore()).isEqualByComparingTo("25.5");
        verifyNoInteractions(results,versions);
    }
}
