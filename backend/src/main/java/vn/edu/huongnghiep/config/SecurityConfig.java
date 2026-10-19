package vn.edu.huongnghiep.config;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.*;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.*;
import vn.edu.huongnghiep.modules.auth.GoogleUserService;

@Configuration
public class SecurityConfig {
    @Bean
    @ConditionalOnExpression("'${app.google-client-id:}' != '' && '${app.google-client-secret:}' != ''")
    ClientRegistrationRepository clients(@Value("${app.google-client-id}") String id, @Value("${app.google-client-secret}") String secret) {
        return new InMemoryClientRegistrationRepository(CommonOAuth2Provider.GOOGLE.getBuilder("google")
            .clientId(id).clientSecret(secret).scope("openid", "profile", "email").build());
    }

    @Bean
    SecurityFilterChain security(HttpSecurity http, ObjectProvider<ClientRegistrationRepository> clients,
                                  GoogleUserService google, @Value("${app.frontend-origin}") String origin) throws Exception {
        http.authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/admin/**", "/api/me/**").authenticated()
            .requestMatchers("/api/**", "/oauth2/**", "/login/oauth2/**", "/error").permitAll()
            .anyRequest().denyAll());
        // The SPA obtains the masked CSRF token from /api/auth/csrf and returns it in the advertised header.
        http.csrf(csrf -> csrf.csrfTokenRepository(new HttpSessionCsrfTokenRepository()));
        http.requestCache(cache -> cache.disable());
        http.exceptionHandling(errors -> errors
            .authenticationEntryPoint((req, res, ex) -> { res.setStatus(401); res.setContentType("application/json"); res.getWriter().write("{\"message\":\"Bạn cần đăng nhập.\"}"); })
            .accessDeniedHandler((req, res, ex) -> { res.setStatus(403); res.setContentType("application/json"); res.getWriter().write("{\"message\":\"Không có quyền hoặc CSRF token không hợp lệ.\"}"); }));
        http.logout(logout -> logout.logoutUrl("/api/logout").logoutSuccessHandler((req, res, auth) -> res.setStatus(204)));
        if (clients.getIfAvailable() != null) {
            http.oauth2Login(login -> login.userInfoEndpoint(info -> info.oidcUserService(google))
                .defaultSuccessUrl(origin + "/dashboard", true)
                .failureUrl(origin + "/login?error=google"));
        }
        return http.build();
    }
}
