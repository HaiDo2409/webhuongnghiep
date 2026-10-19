package vn.edu.huongnghiep.modules.auth;

import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.oauth2.client.oidc.userinfo.*;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import vn.edu.huongnghiep.infrastructure.persistence.*;

@Service
public class GoogleUserService extends OidcUserService {
    private final UserRepository users;
    private final String bootstrapSubject;
    public GoogleUserService(UserRepository users, @Value("${app.bootstrap-admin-subject}") String bootstrapSubject) {
        this.users = users; this.bootstrapSubject = bootstrapSubject;
    }
    @Override @Transactional
    public OidcUser loadUser(OidcUserRequest request) throws OAuth2AuthenticationException {
        OidcUser principal = super.loadUser(request);
        if (!Boolean.TRUE.equals(principal.getEmailVerified())) throw new OAuth2AuthenticationException(new OAuth2Error("unverified_email"));
        var user = users.findByGoogleSubject(principal.getSubject()).orElseGet(() -> {
            var created = new UserEntity();
            created.id = UUID.randomUUID(); created.googleSubject = principal.getSubject();
            created.role = !bootstrapSubject.isBlank() && bootstrapSubject.equals(principal.getSubject()) ? "ADMIN" : "STUDENT";
            created.active = true; created.createdAt = Instant.now();
            return created;
        });
        if (!user.active) throw new OAuth2AuthenticationException(new OAuth2Error("account_disabled"));
        user.email = principal.getEmail();
        user.displayName = principal.getFullName() == null ? "Học sinh" : principal.getFullName();
        user.avatarUrl = principal.getPicture();
        users.save(user);
        return principal;
    }
}
