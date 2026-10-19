package vn.edu.huongnghiep.modules.auth;

import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.http.HttpStatus;
import vn.edu.huongnghiep.shared.ApiException;

@RestController
@RequestMapping("/api/auth")
public class LocalAuthController {
    public record Login(@NotBlank @Size(max=40) String username,@NotBlank @Size(max=72) String password) {}
    private final LocalAccountService accounts;
    private final AuthenticationManager manager;
    private final SecurityContextRepository contexts;
    private final SessionAuthenticationStrategy sessions;
    private final AuthAttemptLimiter limiter;
    public LocalAuthController(LocalAccountService accounts,AuthenticationManager manager,SecurityContextRepository contexts,
                               SessionAuthenticationStrategy sessions,AuthAttemptLimiter limiter) {
        this.accounts=accounts;this.manager=manager;this.contexts=contexts;this.sessions=sessions;this.limiter=limiter;
    }
    @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED)
    Object register(@Valid @RequestBody LocalAccountService.Registration body,HttpServletRequest request) {
        limiter.attempt("register:"+request.getRemoteAddr());
        accounts.register(body); // Public registration always creates STUDENT; request roles are never used.
        return Map.of("message","Đăng ký thành công. Bạn có thể đăng nhập ngay.");
    }
    @PostMapping("/login")
    Object login(@Valid @RequestBody Login body,HttpServletRequest request,HttpServletResponse response) {
        String key="login:"+request.getRemoteAddr()+":"+body.username().strip().toLowerCase(Locale.ROOT);
        limiter.attempt(key);
        try {
            if(body.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72) throw new BadCredentialsException("Invalid credentials");
            var authentication=manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(body.username(),body.password()));
            sessions.onAuthentication(authentication,request,response); // Rotate session ID and invalidate pre-login CSRF.
            var context=SecurityContextHolder.createEmptyContext();context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);contexts.saveContext(context,request,response);limiter.success(key);
            return Map.of("message","Đăng nhập thành công.");
        } catch(AuthenticationException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED,"Tài khoản hoặc mật khẩu không đúng, hoặc tài khoản đã bị khóa.");
        }
    }
}
