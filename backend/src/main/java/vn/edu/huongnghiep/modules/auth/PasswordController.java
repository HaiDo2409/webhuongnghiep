package vn.edu.huongnghiep.modules.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.session.jdbc.JdbcIndexedSessionRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me/password")
public class PasswordController {
    private final CurrentActor actor;
    private final LocalAccountService accounts;
    private final AuthAttemptLimiter limiter;
    private final JdbcIndexedSessionRepository sessions;
    public PasswordController(CurrentActor actor,LocalAccountService accounts,AuthAttemptLimiter limiter,JdbcIndexedSessionRepository sessions) {
        this.actor=actor;this.accounts=accounts;this.limiter=limiter;this.sessions=sessions;
    }
    @GetMapping
    Object available() {
        var user=actor.require();
        return Map.of("canChangePassword",user.localUsername!=null && user.passwordHash!=null && !user.passwordHash.isBlank());
    }
    @PostMapping
    Object change(@Valid @RequestBody LocalAccountService.PasswordChange body,HttpServletRequest request) {
        var user=actor.require();
        String key="password-change:"+user.id;
        limiter.attempt(key);
        accounts.changePassword(user.id,body);
        // Password is committed before revoking sessions. Never store password input in audit/session data.
        sessions.findByPrincipalName(user.id.toString()).keySet().forEach(sessions::deleteById);
        var current=request.getSession(false);
        if(current!=null)current.invalidate();
        SecurityContextHolder.clearContext();
        limiter.success(key);
        return Map.of("message","Đã đổi mật khẩu. Hãy đăng nhập lại bằng mật khẩu mới.");
    }
}
