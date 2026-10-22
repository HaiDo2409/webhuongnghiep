package vn.edu.huongnghiep.modules.auth;

import jakarta.validation.constraints.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.shared.*;

@Service
public class LocalAccountService {
    public record Registration(@NotBlank @Pattern(regexp="[a-zA-Z0-9][a-zA-Z0-9_.-]{2,39}") String username,
        @NotBlank @Size(max=100) String displayName, @NotBlank @Size(min=8,max=72) String password) {}
    public record PasswordChange(@NotBlank @Size(max=72) String currentPassword,
        @NotBlank @Size(min=8,max=72) String newPassword,@NotBlank @Size(min=8,max=72) String confirmPassword) {}
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuditService audit;
    public LocalAccountService(UserRepository users,PasswordEncoder encoder,AuditService audit) {this.users=users;this.encoder=encoder;this.audit=audit;}
    @Transactional
    public UUID register(Registration request) {
        if(Set.of("admin","administrator").contains(request.username().strip().toLowerCase(Locale.ROOT))) throw ApiException.invalid("Tên tài khoản này dành cho quản trị. Vui lòng chọn tên khác.");
        return create(request,"STUDENT");
    }
    @Transactional
    public void bootstrapAdmin(String username,String password) {
        var key=username.strip().toLowerCase(Locale.ROOT);
        if(users.findByLocalUsername(key).isPresent()) return; // Never promote, reset or overwrite an existing account.
        create(new Registration(username,"Quản trị viên",password),"ADMIN");
    }
    @Transactional
    public void changePassword(UUID userId,PasswordChange request) {
        var user=users.lockById(userId).orElseThrow(ApiException::missing);
        if(!user.active)throw new ApiException(HttpStatus.FORBIDDEN,"Tài khoản đã bị khóa.");
        if(user.localUsername==null || user.passwordHash==null || user.passwordHash.isBlank())
            throw ApiException.invalid("Tài khoản này chưa có mật khẩu đăng nhập.");
        if(request.currentPassword().getBytes(StandardCharsets.UTF_8).length>72 || !encoder.matches(request.currentPassword(),user.passwordHash))
            throw ApiException.invalid("Mật khẩu hiện tại chưa đúng.");
        if(request.newPassword().length()<8 || request.newPassword().isBlank() || request.newPassword().getBytes(StandardCharsets.UTF_8).length>72)
            throw ApiException.invalid("Mật khẩu mới cần ít nhất 8 ký tự và tối đa 72 byte UTF-8.");
        if(!request.newPassword().equals(request.confirmPassword()))throw ApiException.invalid("Mật khẩu xác nhận chưa khớp.");
        if(encoder.matches(request.newPassword(),user.passwordHash))throw ApiException.invalid("Mật khẩu mới cần khác mật khẩu hiện tại.");
        user.passwordHash=encoder.encode(request.newPassword());users.saveAndFlush(user);
        audit.record(user.id,"PASSWORD_CHANGED",user.id);
    }
    private UUID create(Registration r,String role) {
        String key=r.username().strip().toLowerCase(Locale.ROOT);
        if(!key.matches("[a-z0-9][a-z0-9_.-]{2,39}")) throw ApiException.invalid("Tài khoản dài 3–40 ký tự, chỉ dùng chữ không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.");
        if(r.password()==null || r.password().length()<8 || r.password().getBytes(StandardCharsets.UTF_8).length>72 || r.password().isBlank())
            throw ApiException.invalid("Mật khẩu cần ít nhất 8 ký tự và tối đa 72 byte UTF-8.");
        if(r.displayName()==null || r.displayName().isBlank() || r.displayName().length()>100) throw ApiException.invalid("Họ tên không hợp lệ.");
        if(users.findByLocalUsername(key).isPresent()) throw new ApiException(HttpStatus.CONFLICT,"Tên tài khoản đã được sử dụng.");
        var u=new UserEntity();u.id=UUID.randomUUID();u.localUsername=key;u.passwordHash=encoder.encode(r.password());
        u.email="";u.displayName=r.displayName().strip();u.role=role;u.active=true;u.createdAt=Instant.now();users.saveAndFlush(u);
        audit.record(u.id,"LOCAL_ACCOUNT_CREATED",u.id);return u.id;
    }
}
