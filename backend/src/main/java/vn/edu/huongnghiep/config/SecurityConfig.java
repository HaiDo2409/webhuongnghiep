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
import vn.edu.huongnghiep.modules.auth.LocalUserDetailsService;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.crypto.password.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.context.*;
import org.springframework.security.web.authentication.session.*;
import java.util.List;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }
    @Bean DaoAuthenticationProvider localAuthenticationProvider(LocalUserDetailsService users,PasswordEncoder encoder) {
        var provider=new DaoAuthenticationProvider(users);provider.setPasswordEncoder(encoder);return provider;
    }
    @Bean AuthenticationManager authenticationManager(DaoAuthenticationProvider provider) { return new ProviderManager(provider); }
    @Bean CsrfTokenRepository csrfTokenRepository() { return new HttpSessionCsrfTokenRepository(); }
    @Bean SecurityContextRepository securityContextRepository() { return new HttpSessionSecurityContextRepository(); }
    @Bean SessionAuthenticationStrategy sessionAuthenticationStrategy(CsrfTokenRepository csrf) {
        return new CompositeSessionAuthenticationStrategy(List.of(new ChangeSessionIdAuthenticationStrategy(),new CsrfAuthenticationStrategy(csrf)));
    }
    @Bean
    @ConditionalOnExpression("'${app.google-client-id:}' != '' && '${app.google-client-secret:}' != ''")
    ClientRegistrationRepository clients(@Value("${app.google-client-id}") String id, @Value("${app.google-client-secret}") String secret) {
        return new InMemoryClientRegistrationRepository(CommonOAuth2Provider.GOOGLE.getBuilder("google")
            .clientId(id).clientSecret(secret).scope("openid", "profile", "email").build());
    }

    @Bean
    SecurityFilterChain security(HttpSecurity http, ObjectProvider<ClientRegistrationRepository> clients,
                                  GoogleUserService google,DaoAuthenticationProvider provider,
                                  CsrfTokenRepository csrfRepository,SecurityContextRepository contexts,
                                  SessionAuthenticationStrategy sessions,@Value("${app.frontend-origin}") String origin) throws Exception {
        http.authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/admin/**", "/api/me/**").authenticated()
            .requestMatchers("/api/**", "/oauth2/**", "/login/oauth2/**", "/error").permitAll()
            .anyRequest().denyAll());
        // The SPA obtains the masked CSRF token from /api/auth/csrf and returns it in the advertised header.
        http.csrf(csrf -> csrf.csrfTokenRepository(csrfRepository));
        http.authenticationProvider(provider);
        http.securityContext(context -> context.securityContextRepository(contexts).requireExplicitSave(true));
        http.sessionManagement(session -> session.sessionAuthenticationStrategy(sessions));
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
