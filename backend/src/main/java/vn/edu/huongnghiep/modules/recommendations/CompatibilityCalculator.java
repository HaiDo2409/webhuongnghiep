package vn.edu.huongnghiep.modules.recommendations;
import java.util.Map;
import java.util.List;

public class CompatibilityCalculator {
    private static final List<String> DIMENSIONS=List.of("R","I","A","S","E","C");
    public Double compare(Map<String,Double> student,Map<String,Double> major) {
        if(student==null || major==null) return null;
        double dot=0, a=0, b=0;
        for(String d:DIMENSIONS) {
            double x=student.getOrDefault(d,0.0), y=major.getOrDefault(d,0.0);
            dot+=x*y; a+=x*x; b+=y*y;
        }
        if(a==0 || b==0) return null;
        return Math.round(Math.min(1,dot/Math.sqrt(a*b))*10000)/100.0;
    }
}
