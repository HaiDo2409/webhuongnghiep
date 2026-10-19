package vn.edu.huongnghiep.infrastructure.persistence;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface StudentProfileRepository extends JpaRepository<StudentProfileEntity, UUID> {
    
}
