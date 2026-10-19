package vn.edu.huongnghiep.infrastructure.persistence;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.UUID;
import java.time.Instant;
import java.math.BigDecimal;

@Entity
@Table(name="quiz_versions")
public class QuizVersionEntity {
    @Id public UUID id;
    public String quizType;
    public int version;
    public String title;
    public String status;
    @JdbcTypeCode(SqlTypes.JSON) public JsonNode questions;
    @Version public long revision;
    public Instant createdAt;
}
