package vn.edu.huongnghiep.infrastructure.persistence;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface QuizVersionRepository extends JpaRepository<QuizVersionEntity, UUID> {
    List<QuizVersionEntity> findByStatusOrderByQuizType(String status);
    Optional<QuizVersionEntity> findFirstByQuizTypeOrderByVersionDesc(String type);
    @Modifying @Query("update QuizVersionEntity q set q.status = 'ARCHIVED', q.revision = q.revision + 1 where q.quizType = :type and q.status = 'PUBLISHED'")
    void archivePublished(@Param("type") String type);
}
