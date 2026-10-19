package vn.edu.huongnghiep.modules.profiles;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.modules.auth.CurrentActor;
import vn.edu.huongnghiep.modules.admissions.ProgramService;
import vn.edu.huongnghiep.shared.ApiException;

@RestController
@RequestMapping("/api/me/profile")
public class ProfileController {
    public record ProfileRequest(@Size(max=255) String schoolName,@Size(max=50) String grade,
        @Min(2000) @Max(2100) int targetYear,
        @NotNull @Size(max=9) Map<String,@NotNull @DecimalMin("0") @DecimalMax("10") BigDecimal> scores,long revision) {}
    private final StudentProfileRepository profiles;
    private final CurrentActor actor;
    private final ObjectMapper mapper;
    public ProfileController(StudentProfileRepository profiles,CurrentActor actor,ObjectMapper mapper) { this.profiles=profiles;this.actor=actor;this.mapper=mapper; }
    @GetMapping @Transactional(readOnly=true)
    Object get() {
        return profiles.findById(actor.require().id).map(p->Map.of("data",p.data,"revision",p.revision)).orElse(Map.of("data",mapper.createObjectNode(),"revision",0L));
    }
    @PutMapping @Transactional
    Object save(@Valid @RequestBody ProfileRequest r) {
        var user=actor.require();
        if(!ProgramService.SUBJECTS.containsAll(r.scores().keySet())) throw ApiException.invalid("Môn học không hợp lệ.");
        var profile=profiles.findById(user.id).orElseGet(()->{var p=new StudentProfileEntity();p.userId=user.id;return p;});
        if(profile.revision!=r.revision()) throw new ApiException(org.springframework.http.HttpStatus.CONFLICT,"Hồ sơ đã thay đổi. Hãy tải lại.");
        profile.data=mapper.valueToTree(r);profiles.saveAndFlush(profile);
        return Map.of("data",profile.data,"revision",profile.revision);
    }
}
