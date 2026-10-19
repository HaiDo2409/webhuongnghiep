package vn.edu.huongnghiep.modules.admissions;

import java.math.BigDecimal;
import java.util.*;

/** Raw three-subject comparison only. Official conversions and priority rules require separate strategies. */
public class SubjectScoreCalculator {
    public record Score(BigDecimal rawScore,String group) {}
    public Optional<Score> best(Map<String,BigDecimal> scores,List<ProgramService.SubjectGroup> groups) {
        if(scores==null) return Optional.empty();
        return groups.stream().filter(g->g.subjects().stream().allMatch(s->scores.get(s)!=null))
            .map(g->new Score(g.subjects().stream().map(scores::get).reduce(BigDecimal.ZERO,BigDecimal::add),g.code()))
            .max(Comparator.comparing(Score::rawScore));
    }
}
