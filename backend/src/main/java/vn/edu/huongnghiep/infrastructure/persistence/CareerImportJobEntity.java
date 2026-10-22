package vn.edu.huongnghiep.infrastructure.persistence;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="career_import_jobs")
public class CareerImportJobEntity {
    @Id public UUID id;
    public UUID actorId;
    public String filename;
    public String checksum;
    public String status;
    @JdbcTypeCode(SqlTypes.JSON) public JsonNode rows;
    @JdbcTypeCode(SqlTypes.JSON) public JsonNode changes;
    @JdbcTypeCode(SqlTypes.JSON) public JsonNode supplements;
    public Instant createdAt;
    public Instant committedAt;
}
