package vn.edu.huongnghiep;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;
import vn.edu.huongnghiep.modules.admissions.*;
import vn.edu.huongnghiep.shared.ApiException;

class AdmissionPredictionTest {
    private static BigDecimal n(String v) { return new BigDecimal(v); }
    private final PriorityCalculator priority=new PriorityCalculator();
    private final PriorityCalculator.Priority kv1=new PriorityCalculator.Priority(PriorityCalculator.Region.KV1,PriorityCalculator.Category.NONE,2026);
    private final PriorityCalculator.Priority noPriority=new PriorityCalculator.Priority(PriorityCalculator.Region.KV3,PriorityCalculator.Category.NONE,2026);
    private final SchoolScoreCalculator school=new SchoolScoreCalculator();
    private BenchmarkHistoryService.Point point(int year,String score,boolean verified,boolean comparable) {
        return new BenchmarkHistoryService.Point("A00",year,n(score),"https://example.edu.vn/cutoffs/"+year,verified,comparable);
    }
    @Test void priorityTapersAtBoundaryAndNeverExceedsScale() {
        assertThat(priority.calculate(n("22.49"),n("30"),2026,kv1)).isEqualByComparingTo("0.75");
        assertThat(priority.calculate(n("22.5"),n("30"),2026,kv1)).isEqualByComparingTo("0.75");
        assertThat(priority.calculate(n("27"),n("30"),2026,kv1)).isEqualByComparingTo("0.30");
        assertThat(priority.calculate(n("30"),n("30"),2026,kv1)).isZero();
    }
    @Test void regionExpiresButObjectPriorityDoesNot() {
        var input=new PriorityCalculator.Priority(PriorityCalculator.Region.KV1,PriorityCalculator.Category.UT2,2024);
        assertThat(priority.calculate(n("20"),n("30"),2026,input)).isEqualByComparingTo("1.00");
        var previous=new PriorityCalculator.Priority(PriorityCalculator.Region.KV1,PriorityCalculator.Category.NONE,2025);
        assertThat(priority.calculate(n("20"),n("30"),2026,previous)).isEqualByComparingTo("0.75");
    }
    @Test void fortyPointPriorityUsesEquivalentThirtyPointThreshold() {
        assertThat(priority.calculate(n("36"),n("40"),2026,kv1)).isEqualByComparingTo("0.40");
    }
    @Test void weightedHistoryUsesOnlyThreePreviousYears() {
        var result=BenchmarkHistoryService.estimate(2026,"A00",n("26.80"),List.of(point(2025,"27",true,true),point(2024,"26",true,true),point(2023,"25",true,true),point(2026,"30",true,true)));
        assertThat(result.reference()).isEqualByComparingTo("26.30");
        assertThat(result.band()).isEqualTo("NEAR"); // inclusive +0.50 boundary
        assertThat(result.points()).extracting(BenchmarkHistoryService.Point::year).containsExactly(2025,2024,2023);
    }
    @Test void missingUnverifiedAndIncomparableDataNeverBecomeZero() {
        var result=BenchmarkHistoryService.estimate(2026,"A00",n("30"),List.of(point(2025,"27",true,true),point(2024,"26",false,true),point(2023,"25",true,false)));
        assertThat(result.reference()).isNull();assertThat(result.missingYears()).containsExactly(2024,2023);
        assertThat(result.band()).isEqualTo("INSUFFICIENT_DATA");
        assertThat(BenchmarkHistoryService.estimate(2026,"A01",n("30"),List.of(point(2025,"27",true,true))).points()).isEmpty();
    }
    @Test void opportunityBandsUseExplicitHalfPointMargin() {
        var points=List.of(point(2025,"27",true,true),point(2024,"26",true,true),point(2023,"25",true,true));
        assertThat(BenchmarkHistoryService.estimate(2026,"A00",n("25.79"),points).band()).isEqualTo("BELOW");
        assertThat(BenchmarkHistoryService.estimate(2026,"A00",n("26.81"),points).band()).isEqualTo("ABOVE");
        assertThat(BenchmarkHistoryService.estimate(2026,"A00",null,points).band()).isEqualTo("NO_SCORE");
    }
    private SchoolScoreCalculator.Input aptitude(String policy,String score,int year) {
        return new SchoolScoreCalculator.Input(policy,year,noPriority,n(score),2026,"ENGLISH",null,null,null,null,null,null,null,true,true);
    }
    @Test void aptitudeUsesSchoolFormulaNotDivisionByExamMaximum() {
        assertThat(school.calculate(aptitude("FTU_HSA_30","100",2026)).totalScore()).isEqualByComparingTo("27.00");
        assertThat(school.calculate(aptitude("FTU_HSA_30","125",2026)).totalScore()).isEqualByComparingTo("28.50");
        assertThat(school.calculate(aptitude("FTU_VACT_30","1025",2026)).totalScore()).isEqualByComparingTo("28.50");
        assertThat(school.calculate(aptitude("FTU_TSA_40","85",2026)).totalScore()).isEqualByComparingTo("38.00");
    }
    @Test void aptitudeRejectsWrongYearPolicyAndScale() {
        assertThatThrownBy(()->school.calculate(aptitude("FTU_HSA_30","151",2026))).isInstanceOf(ApiException.class);
        assertThatThrownBy(()->school.calculate(aptitude("FTU_HSA_30","120",2025))).isInstanceOf(ApiException.class);
        assertThatThrownBy(()->school.calculate(aptitude("HUST_HSA_30","120",2026))).isInstanceOf(ApiException.class);
        assertThat(school.calculate(aptitude("FTU_HSA_30","99",2026)).declaredRequirementsMet()).isFalse();
    }
    private SchoolScoreCalculator.Input transcript(String policy,LocalDate date,List<BigDecimal> math) {
        return new SchoolScoreCalculator.Input(policy,2026,noPriority,null,null,null,Map.of("toan",math,"ly",List.of(n("9"),n("9"),n("9"))),"ly",n("6.5"),date,n("8"),n("8"),"SPECIALIZED",true,true);
    }
    @Test void transcriptUsesSubjectAveragesAndSchoolSpecificIelts() {
        var result=school.calculate(transcript("FTU_TRANSCRIPT_30",LocalDate.of(2025,7,2),List.of(n("8"),n("9"),n("10"))));
        assertThat(result.certificateScore()).isEqualByComparingTo("8.5");assertThat(result.totalScore()).isEqualByComparingTo("26.50");assertThat(result.declaredRequirementsMet()).isTrue();
        assertThat(school.calculate(transcript("FTU_TRANSCRIPT_40",LocalDate.of(2025,7,2),List.of(n("8"),n("9"),n("10")))).totalScore()).isEqualByComparingTo("35.50");
    }
    @Test void certificateExpirationAndMissingGradesAreNotSilentlyAccepted() {
        var input=transcript("FTU_TRANSCRIPT_30",LocalDate.of(2024,7,1),List.of(n("9"),n("9"),n("9")));
        assertThat(school.calculate(input).declaredRequirementsMet()).isFalse();
        assertThatThrownBy(()->school.calculate(transcript("FTU_TRANSCRIPT_30",LocalDate.of(2025,7,2),List.of(n("9"))))).isInstanceOf(ApiException.class);
        assertThatThrownBy(()->SchoolScoreCalculator.ielts(n("6.7"))).isInstanceOf(ApiException.class);
        assertThat(SchoolScoreCalculator.ielts(n("8.5"))).isEqualByComparingTo("10");
    }
}
