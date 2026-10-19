package vn.edu.huongnghiep.modules.auth;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.shared.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final CurrentActor actor;
    private final UserRepository users;
    private final AuditLogRepository logs;
    private final AuditService audit;
    public AdminController(CurrentActor actor,UserRepository users,AuditLogRepository logs,AuditService audit) {this.actor=actor;this.users=users;this.logs=logs;this.audit=audit;}
    private Map<String,Object> dto(UserEntity u) {return Map.of("id",u.id,"displayName",u.displayName,"email",u.email,"role",u.role,"active",u.active);}
    @GetMapping("/users") Object users() {actor.admin();return users.findAll().stream().map(this::dto).toList();}
    public record AccessRequest(@NotNull @Pattern(regexp="STUDENT|ADMIN") String role,boolean active) {}
    @PutMapping("/users/{id}/access") @Transactional
    Object access(@PathVariable UUID id,@Valid @RequestBody AccessRequest r) {
        var admin=actor.admin();if(admin.id.equals(id)) throw ApiException.invalid("Không thể tự đổi quyền hoặc tự khóa tài khoản quản trị.");
        var user=users.findById(id).orElseThrow(ApiException::missing);user.role=r.role();user.active=r.active();users.save(user);
        audit.record(admin.id,"USER_ACCESS_UPDATED",id);return dto(user);
    }
    @GetMapping("/audit-logs") Object logs() {
        actor.admin();return logs.findTop100ByOrderByCreatedAtDesc().stream().map(e->Map.of("id",e.id,"actorId",e.actorId,"action",e.action,"targetId",e.targetId,"createdAt",e.createdAt)).toList();
    }
}
