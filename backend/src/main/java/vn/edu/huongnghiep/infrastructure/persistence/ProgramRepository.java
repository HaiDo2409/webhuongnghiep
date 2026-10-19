package vn.edu.huongnghiep.infrastructure.persistence;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface ProgramRepository extends JpaRepository<ProgramEntity, UUID> {
    List<ProgramEntity> findByPublishedTrueOrderBySchoolAscMajorAsc();
}
