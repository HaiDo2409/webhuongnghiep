package vn.edu.huongnghiep.infrastructure;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import vn.edu.huongnghiep.modules.auth.LocalAccountService;

@Component
@ConditionalOnProperty(name="app.local-admin-enabled",havingValue="true")
public class LocalAdminBootstrap implements ApplicationRunner {
    private final LocalAccountService accounts;
    private final String username;
    private final String password;
    public LocalAdminBootstrap(LocalAccountService accounts,@Value("${app.local-admin-username:}") String username,
                               @Value("${app.local-admin-password:}") String password) {
        this.accounts=accounts;this.username=username;this.password=password;
    }
    @Override public void run(ApplicationArguments args) {
        if(username.isBlank() || password.isBlank()) throw new IllegalStateException("Bootstrap admin requires explicit username and password configuration.");
        accounts.bootstrapAdmin(username,password);
    }
}
