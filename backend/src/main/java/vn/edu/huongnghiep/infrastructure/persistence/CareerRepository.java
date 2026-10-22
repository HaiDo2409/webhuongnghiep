package vn.edu.huongnghiep.infrastructure.persistence;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface CareerRepository extends JpaRepository<CareerEntity, String> {
    Optional<CareerEntity> findByOnetCode(String code);
    List<CareerEntity> findByPublishedTrue();
}
