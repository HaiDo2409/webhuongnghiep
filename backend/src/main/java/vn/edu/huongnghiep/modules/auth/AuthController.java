package vn.edu.huongnghiep.modules.auth;

import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {
    private final CurrentActor actor;
    private final boolean googleEnabled;
    public AuthController(CurrentActor actor, @Value("${app.google-client-id}") String id, @Value("${app.google-client-secret}") String secret) {
        this.actor = actor; this.googleEnabled = !id.isBlank() && !secret.isBlank();
    }
    @GetMapping("/api/auth/config") Object config() { return Map.of("googleEnabled", googleEnabled); }
    @GetMapping("/api/auth/csrf") Object csrf(CsrfToken token) { return Map.of("token", token.getToken(), "headerName", token.getHeaderName()); }
    @GetMapping("/api/users/me") Object me() {
        var user = actor.optional();
        if (user == null) return Map.of("authenticated", false);
        return Map.of("authenticated", true, "id", user.id, "displayName", user.displayName,
            "email", user.email, "avatarUrl", user.avatarUrl == null ? "" : user.avatarUrl,
            "username", user.id.toString(), "roles", List.of(user.role), "permissions", "ADMIN".equals(user.role) ? "1" : "0");
    }
}
