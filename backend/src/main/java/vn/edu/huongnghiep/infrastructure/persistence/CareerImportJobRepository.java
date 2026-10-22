package vn.edu.huongnghiep.infrastructure.persistence;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
public interface CareerImportJobRepository extends JpaRepository<CareerImportJobEntity,UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select j from CareerImportJobEntity j where j.id=:id") Optional<CareerImportJobEntity> lockById(UUID id);
    List<CareerImportJobEntity> findTop30ByOrderByCreatedAtDesc();
    boolean existsByChecksumAndStatus(String checksum,String status);
    boolean existsByChecksum(String checksum);
}
