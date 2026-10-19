package vn.edu.huongnghiep.infrastructure.persistence;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByGoogleSubject(String subject);
    Optional<UserEntity> findByLocalUsername(String username);
}
