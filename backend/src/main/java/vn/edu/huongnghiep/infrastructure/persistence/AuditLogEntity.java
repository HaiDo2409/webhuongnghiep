package vn.edu.huongnghiep.infrastructure.persistence;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.UUID;
import java.time.Instant;
import java.math.BigDecimal;

@Entity
@Table(name="audit_logs")
public class AuditLogEntity {
    @Id public UUID id;
    public UUID actorId;
    public String action;
    public String targetId;
    public Instant createdAt;
}
