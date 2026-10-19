package vn.edu.huongnghiep.infrastructure.persistence;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface RecommendationRunRepository extends JpaRepository<RecommendationRunEntity, UUID> {
    List<RecommendationRunEntity> findTop20ByUserIdOrderByCreatedAtDesc(UUID userId);
}
