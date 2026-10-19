package vn.edu.huongnghiep.modules.auth;

import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.*;
import vn.edu.huongnghiep.infrastructure.persistence.UserRepository;

@Service
public class LocalUserDetailsService implements UserDetailsService {
    private final UserRepository users;
    public LocalUserDetailsService(UserRepository users) { this.users=users; }
    @Override public UserDetails loadUserByUsername(String username) {
        var user=users.findByLocalUsername(username.strip().toLowerCase(Locale.ROOT))
            .orElseThrow(()->new UsernameNotFoundException("Tài khoản hoặc mật khẩu không đúng."));
        // Session principals contain the immutable internal ID, not the mutable login name.
        return User.withUsername(user.id.toString()).password(user.passwordHash)
            .disabled(!user.active).roles(user.role).build();
    }
}
