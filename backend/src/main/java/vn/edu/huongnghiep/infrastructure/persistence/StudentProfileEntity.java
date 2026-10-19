package vn.edu.huongnghiep.infrastructure.persistence;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.UUID;
import java.time.Instant;
import java.math.BigDecimal;

@Entity
@Table(name="student_profiles")
public class StudentProfileEntity {
    @Id public UUID userId;
    @JdbcTypeCode(SqlTypes.JSON) public JsonNode data;
    @Version public long revision;
}
