package vn.edu.huongnghiep.infrastructure.persistence;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface QuizResultRepository extends JpaRepository<QuizResultEntity, UUID> {
    List<QuizResultEntity> findTop50ByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID userId);
    Optional<QuizResultEntity> findByIdAndUserId(UUID id, UUID userId);
    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from QuizResultEntity r where r.id = :id")
    Optional<QuizResultEntity> lockById(@Param("id") UUID id);
}
