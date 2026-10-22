package vn.edu.huongnghiep.infrastructure.persistence;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SchoolRepository extends JpaRepository<SchoolEntity,UUID>{
 Optional<SchoolEntity> findByCode(String code);
 List<SchoolEntity> findAllByOrderByNameAsc();
}
