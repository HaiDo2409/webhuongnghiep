package vn.edu.huongnghiep.infrastructure.persistence;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.UUID;
import java.time.Instant;
import java.math.BigDecimal;

@Entity
@Table(name="quiz_results")
public class QuizResultEntity {
    @Id public UUID id;
    public UUID userId;
    public UUID quizVersionId;
    @JdbcTypeCode(SqlTypes.JSON) public JsonNode answers;
    @JdbcTypeCode(SqlTypes.JSON) public JsonNode scores;
    @JdbcTypeCode(SqlTypes.JSON) public JsonNode normalizedScores;
    public Instant createdAt;
    public Instant deletedAt;
}
