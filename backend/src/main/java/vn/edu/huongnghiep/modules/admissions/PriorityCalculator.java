package vn.edu.huongnghiep.modules.admissions;

import java.math.BigDecimal;
import java.math.RoundingMode;
import jakarta.validation.constraints.*;
import vn.edu.huongnghiep.shared.ApiException;

/** All input/output scales are explicit. Holland is deliberately absent. */
public class PriorityCalculator {
    public enum Region { KV1, KV2NT, KV2, KV3 }
    public enum Category { NONE, UT1, UT2 }
    public record Priority(@NotNull Region region, @NotNull Category category,
                           @Min(2000) @Max(2100) int graduationYear) {}
    public static BigDecimal round(BigDecimal n) { return n.setScale(2,RoundingMode.HALF_UP); }
    public BigDecimal calculate(BigDecimal score, BigDecimal scale, int year, Priority input) {
        if(input==null) return new BigDecimal("0.00");
        if(input.region()==null || input.category()==null || input.graduationYear()>year || input.graduationYear()<2000)
            throw ApiException.invalid("Thông tin ưu tiên hoặc năm tốt nghiệp không hợp lệ.");
        BigDecimal regional=switch(input.region()) {
            case KV1 -> new BigDecimal("0.75"); case KV2NT -> new BigDecimal("0.50");
            case KV2 -> new BigDecimal("0.25"); case KV3 -> BigDecimal.ZERO;
        };
        if(year-input.graduationYear()>1) regional=BigDecimal.ZERO;
        BigDecimal object=switch(input.category()) { case UT1 -> new BigDecimal("2"); case UT2 -> BigDecimal.ONE; case NONE -> BigDecimal.ZERO; };
        BigDecimal equivalent=score.multiply(new BigDecimal("30")).divide(scale,12,RoundingMode.HALF_UP);
        BigDecimal factor=BigDecimal.ONE;
        if(equivalent.compareTo(new BigDecimal("22.5"))>=0)
            factor=new BigDecimal("30").subtract(equivalent).max(BigDecimal.ZERO).divide(new BigDecimal("7.5"),12,RoundingMode.HALF_UP);
        return round(regional.add(object).multiply(factor).multiply(scale).divide(new BigDecimal("30"),12,RoundingMode.HALF_UP));
    }
}
