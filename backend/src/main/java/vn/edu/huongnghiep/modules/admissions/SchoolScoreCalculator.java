package vn.edu.huongnghiep.modules.admissions;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import vn.edu.huongnghiep.shared.ApiException;

/** Whitelisted, versioned strategies. Client input never supplies a formula. */
public class SchoolScoreCalculator {
    public static final String SOURCE="https://thongtintuyensinh.ftu.edu.vn/admissions-methods";
    public record Policy(String id,int year,String school,String method,String title,String exam,
                         int scale,String formula,String sourceUrl,String version) {}
    private static Policy policy(String id,String method,String title,String exam,int scale,String formula) {
        return new Policy(id,2026,"Đại học Ngoại thương",method,title,exam,scale,formula,SOURCE,"FTU-2026-v1");
    }
    public static final List<Policy> POLICIES=List.of(
        policy("FTU_HSA_30","APTITUDE","Tiêu chuẩn / ĐHNN&PTQT — HSA (không luật, ngôn ngữ)","HSA",30,"27 + (HSA − 100) × 3 / 50 + ưu tiên"),
        policy("FTU_VACT_30","APTITUDE","Tiêu chuẩn / ĐHNN&PTQT — V-ACT (không luật, ngôn ngữ)","VACT",30,"27 + (V-ACT − 850) × 3 / 350 + ưu tiên"),
        policy("FTU_HSA_40","APTITUDE","Tích hợp Khoa học máy tính / AI / Khoa học dữ liệu — HSA","HSA",40,"[27 + (HSA − 100) × 3 / 50] × 4 / 3 + ưu tiên thang 40"),
        policy("FTU_VACT_40","APTITUDE","Tích hợp Khoa học máy tính / AI / Khoa học dữ liệu — V-ACT","VACT",40,"[27 + (V-ACT − 850) × 3 / 350] × 4 / 3 + ưu tiên thang 40"),
        policy("FTU_TSA_40","APTITUDE","Tích hợp Khoa học máy tính / AI / Khoa học dữ liệu — TSA","TSA",40,"[27 + (TSA − 70) × 3 / 30] × 4 / 3 + ưu tiên thang 40"),
        policy("FTU_TRANSCRIPT_30","COMBINED","Học bạ + IELTS: TT / CLC / ĐHNN&PTQT (không luật, ngôn ngữ)","IELTS",30,"TB Toán lớp 10–12 + TB môn thứ hai lớp 10–12 + IELTS quy đổi + ưu tiên"),
        policy("FTU_TRANSCRIPT_40","COMBINED","Học bạ + IELTS: tích hợp Khoa học máy tính / AI / Khoa học dữ liệu","IELTS",40,"TB Toán lớp 10–12 × 2 + TB môn thứ hai lớp 10–12 + IELTS quy đổi + ưu tiên thang 40")
    );
    public record Input(@NotBlank String policyId,@Min(2000) @Max(2100) int year,
        @Valid @NotNull PriorityCalculator.Priority priority,
        @DecimalMin("0") @DecimalMax("1200") BigDecimal examScore,Integer examYear,String hsaSection,
        @Size(max=4) Map<String,List<BigDecimal>> transcript,String secondSubject,
        @DecimalMin("0") @DecimalMax("9") BigDecimal ielts,LocalDate certificateDate,
        @DecimalMin("0") @DecimalMax("10") BigDecimal thptMath,@DecimalMin("0") @DecimalMax("10") BigDecimal thptSecond,
        String applicantGroup,boolean academicRequirement,boolean conductRequirement) {}
    public record Check(String label,boolean passed) {}
    public record Result(Policy policy,BigDecimal baseScore,BigDecimal certificateScore,BigDecimal priorityScore,
        BigDecimal totalScore,boolean declaredRequirementsMet,List<Check> checks,List<String> steps,List<String> notes) {}
    private final PriorityCalculator priorities=new PriorityCalculator();
    private static BigDecimal n(String value) { return new BigDecimal(value); }
    public Result calculate(Input r) {
        var p=POLICIES.stream().filter(v->v.id().equals(r.policyId())).findFirst().orElseThrow(()->ApiException.invalid("Chưa hỗ trợ quy tắc này."));
        if(r.year()!=p.year()) throw ApiException.invalid("Quy tắc này chỉ áp dụng tuyển sinh năm 2026.");
        if(r.priority()==null || r.priority().graduationYear()>2026) throw ApiException.invalid("Cần thông tin ưu tiên và năm tốt nghiệp hợp lệ.");
        List<Check> checks=new ArrayList<>();List<String> steps=new ArrayList<>();BigDecimal base,certificate=null;
        checks.add(new Check(p.method().equals("APTITUDE")?"Học tập từng năm lớp 10–12 đạt Khá trở lên (chương trình cũ: TB mỗi năm ≥ 7)":"Học tập từng năm lớp 10–12 đạt Tốt",r.academicRequirement()));
        checks.add(new Check("Rèn luyện từng năm lớp 10–12 đạt Khá trở lên",r.conductRequirement()));
        if(p.method().equals("APTITUDE")) {
            BigDecimal min,max;
            switch(p.exam()) { case "HSA" -> { min=n("100");max=n("150"); } case "VACT" -> { min=n("850");max=n("1200"); } default -> { min=n("70");max=n("100"); } }
            if(r.examScore()==null || r.examScore().signum()<0 || r.examScore().compareTo(max)>0) throw ApiException.invalid("Điểm thi vượt thang điểm của kỳ thi đã chọn.");
            if(r.examYear()==null || r.examYear()!=2026) throw ApiException.invalid("Ngoại thương yêu cầu kết quả kỳ thi năm 2026 cho quy tắc này.");
            checks.add(new Check("Điểm kỳ thi đạt ngưỡng "+min+"/"+max,r.examScore().compareTo(min)>=0));
            if(p.exam().equals("HSA")) checks.add(new Check("HSA phần 3: Tiếng Anh hoặc Khoa học chọn Vật lý và Hóa học",Set.of("ENGLISH","PHYSICS_CHEMISTRY").contains(Objects.toString(r.hsaSection(),""))));
            // Below-threshold scores are still shown as arithmetic, never labelled eligible.
            base=n("27").add(r.examScore().subtract(min).multiply(n("3")).divide(max.subtract(min),12,RoundingMode.HALF_UP));
            base=base.max(BigDecimal.ZERO).multiply(n(Integer.toString(p.scale()))).divide(n("30"),12,RoundingMode.HALF_UP);
            steps.add("Kết quả "+p.exam()+": "+r.examScore()+"/"+max+" → điểm quy đổi trước ưu tiên: "+PriorityCalculator.round(base)+"/"+p.scale());
        } else {
            if(!Set.of("ly","hoa","van").contains(Objects.toString(r.secondSubject(),""))) throw ApiException.invalid("Môn thứ hai phải là Vật lý, Hóa học hoặc Ngữ văn.");
            BigDecimal math=average(r.transcript(),"toan"),second=average(r.transcript(),r.secondSubject());
            certificate=ielts(r.ielts());
            if(r.certificateDate()==null || r.certificateDate().isAfter(LocalDate.of(2026,6,23))) throw ApiException.invalid("Cần ngày cấp IELTS không sau hạn hồ sơ 23/06/2026.");
            checks.add(new Check("IELTS còn hiệu lực ít nhất đến 02/07/2026",!r.certificateDate().plusYears(2).isBefore(LocalDate.of(2026,7,2))));
            checks.add(new Check("IELTS Academic đạt từ 6.5",r.ielts().compareTo(n("6.5"))>=0));
            checks.add(new Check("Tốt nghiệp THPT năm 2026",r.priority().graduationYear()==2026));
            checks.add(new Check("Học sinh hệ chuyên hoặc không chuyên đạt giải Nhất/Nhì/Ba HSG tỉnh/thành lớp 11/12 đúng môn",Set.of("SPECIALIZED","PROVINCIAL_PRIZE").contains(Objects.toString(r.applicantGroup(),""))));
            BigDecimal averagePair=math.add(second).divide(n("2"),12,RoundingMode.HALF_UP);
            checks.add(new Check("Trung bình hai môn học bạ đạt 8,50 trở lên",averagePair.compareTo(n("8.5"))>=0));
            if(r.thptMath()==null || r.thptSecond()==null || r.thptMath().signum()<0 || r.thptSecond().signum()<0 || r.thptMath().compareTo(BigDecimal.TEN)>0 || r.thptSecond().compareTo(BigDecimal.TEN)>0)
                throw ApiException.invalid("Cần điểm thi THPT môn Toán và môn thứ hai trên thang 10 để kiểm tra ngưỡng.");
            BigDecimal threshold=r.thptMath().add(r.thptSecond()).add(certificate);
            threshold=threshold.add(priorities.calculate(threshold,n("30"),2026,r.priority()));
            checks.add(new Check("Hai môn thi THPT + chứng chỉ quy đổi + ưu tiên đạt ngưỡng 24 (có thể được trường điều chỉnh)",threshold.compareTo(n("24"))>=0));
            base=math.multiply(p.scale()==40?n("2"):BigDecimal.ONE).add(second).add(certificate);
            steps.add("Trung bình cả năm lớp 10, 11, 12: Toán = "+PriorityCalculator.round(math)+"; môn thứ hai = "+PriorityCalculator.round(second));
            steps.add("IELTS Academic "+r.ielts()+" → "+certificate+" điểm; Toán hệ số "+(p.scale()==40?2:1));
        }
        BigDecimal scale=n(Integer.toString(p.scale()));
        BigDecimal priority=priorities.calculate(base,scale,2026,r.priority());
        BigDecimal total=PriorityCalculator.round(base.add(priority).min(scale));
        steps.add("Trước ưu tiên: "+PriorityCalculator.round(base)+"; ưu tiên sau giảm dần và đổi thang: "+priority+"; kết quả: "+total+"/"+p.scale());
        return new Result(p,PriorityCalculator.round(base),certificate,priority,total,checks.stream().allMatch(Check::passed),checks,steps,List.of(
            "Chưa tính điểm thưởng giải thưởng. Kết quả áp dụng trường hợp không có điểm thưởng.",
            "Điều kiện học tập, rèn luyện, đối tượng và chứng chỉ là thông tin tự khai; chưa thẩm định hồ sơ, điều kiện chung hay ngưỡng bổ sung của trường.",
            "Chưa đối chiếu điểm chuẩn của từng mã chương trình cho phương thức này. Không dùng mốc THPT hoặc thang điểm khác để suy ra cơ hội đỗ."));
    }
    private BigDecimal average(Map<String,List<BigDecimal>> transcript,String subject) {
        var values=transcript==null?null:transcript.get(subject);
        if(values==null || values.size()!=3 || values.stream().anyMatch(v->v==null || v.signum()<0 || v.compareTo(BigDecimal.TEN)>0))
            throw ApiException.invalid("Cần đủ điểm trung bình cả năm lớp 10, 11, 12 cho mỗi môn, từ 0 đến 10.");
        return values.stream().reduce(BigDecimal.ZERO,BigDecimal::add).divide(n("3"),12,RoundingMode.HALF_UP);
    }
    public static BigDecimal ielts(BigDecimal score) {
        if(score==null || score.signum()<0 || score.compareTo(n("9"))>0 || score.remainder(n("0.5")).signum()!=0) throw ApiException.invalid("IELTS phải từ 0 đến 9, theo bước 0,5.");
        if(score.compareTo(n("6.5"))<0) return BigDecimal.ZERO;
        if(score.compareTo(n("8"))>=0) return n("10");
        return score.add(n("2"));
    }
}
