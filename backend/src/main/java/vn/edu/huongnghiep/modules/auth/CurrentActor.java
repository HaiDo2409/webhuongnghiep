package vn.edu.huongnghiep.modules.auth;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.shared.ApiException;

@Service
public class CurrentActor {
    private final UserRepository users;
    public CurrentActor(UserRepository users) { this.users = users; }
    public UserEntity optional() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof OidcUser oidc)) return null;
        var user = users.findByGoogleSubject(oidc.getSubject()).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại."));
        if (!user.active) throw new ApiException(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa.");
        return user;
    }
    public UserEntity require() {
        var user = optional();
        if (user == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập.");
        return user;
    }
    public UserEntity admin() {
        var user = require();
        if (!"ADMIN".equals(user.role)) throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền quản trị.");
        return user;
    }
}
