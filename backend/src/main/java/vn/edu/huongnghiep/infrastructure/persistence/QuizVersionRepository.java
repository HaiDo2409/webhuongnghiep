package vn.edu.huongnghiep.infrastructure.persistence;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface QuizVersionRepository extends JpaRepository<QuizVersionEntity, UUID> {
    @Query("select q from QuizVersionEntity q where q.status = :status and q.deletedAt is null order by q.quizType")
    List<QuizVersionEntity> findByStatusOrderByQuizType(@Param("status") String status);
    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select q from QuizVersionEntity q where q.quizType = :type order by q.version")
    List<QuizVersionEntity> lockByQuizType(@Param("type") String type);
    @Query("select q.quizType from QuizVersionEntity q where q.id = :id")
    Optional<String> findQuizType(@Param("id") UUID id);
    Optional<QuizVersionEntity> findFirstByQuizTypeOrderByVersionDesc(String type);
    @Modifying @Query("update QuizVersionEntity q set q.status = 'ARCHIVED', q.revision = q.revision + 1 where q.quizType = :type and q.status = 'PUBLISHED'")
    void archivePublished(@Param("type") String type);
}
