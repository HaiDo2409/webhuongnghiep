package vn.edu.huongnghiep.infrastructure.persistence;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.UUID;
import java.time.Instant;
import java.math.BigDecimal;

@Entity
@Table(name="recommendation_runs")
public class RecommendationRunEntity {
    @Id public UUID id;
    public UUID userId;
    public UUID quizResultId;
    @JdbcTypeCode(SqlTypes.JSON) public JsonNode inputSnapshot;
    @JdbcTypeCode(SqlTypes.JSON) public JsonNode resultSnapshot;
    public String algorithmVersion;
    public Instant createdAt;
}
