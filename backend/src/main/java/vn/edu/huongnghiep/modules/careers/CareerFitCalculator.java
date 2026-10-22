package vn.edu.huongnghiep.modules.careers;
import java.util.*;
/** Ordinal-code recommendation heuristic, NOT O*NET continuous interest measurements. */
public class CareerFitCalculator {
    public record Fit(Double score,String level,String version,String explanation,List<String> matchedCodes) {}
    public Fit compare(Map<String,Double> profile,String code) {
        if(profile==null || profile.values().stream().noneMatch(v->v!=null && v>0)) return new Fit(null,"UNAVAILABLE","holland-code-weighted-v1","Chọn kết quả Holland để xem độ phù hợp sở thích.",List.of());
        double weighted=0,total=0;List<String> matched=new ArrayList<>();
        for(int i=0;i<code.length();i++) { double weight=code.length()-i;String dimension=String.valueOf(code.charAt(i));weighted+=weight*profile.getOrDefault(dimension,0.0);total+=weight;if(profile.getOrDefault(dimension,0.0)>=60) matched.add(dimension); }
        double score=total==0?0:Math.round(weighted/total*10)/10.0;
        String level=score>=75?"HIGH":score>=50?"MODERATE":"EXPLORE";
        return new Fit(score,level,"holland-code-weighted-v1","Trung bình điểm nhóm Holland của bạn, trọng số theo thứ tự mã nghề (3–2–1 cho ba mã; 2–1 cho hai mã). Chỉ phản ánh sở thích, không đo năng lực hay xác suất thành công.",matched);
    }
}
