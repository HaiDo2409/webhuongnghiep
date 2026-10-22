package vn.edu.huongnghiep.infrastructure.persistence;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.UUID;
import java.time.Instant;
import java.math.BigDecimal;

@Entity
@Table(name="programs")
public class ProgramEntity {
    @Id public UUID id;
    public String school;
    public String shortName;
    public String major;
    public String majorCode;
    public int admissionYear;
    @JdbcTypeCode(SqlTypes.JSON) public JsonNode subjectGroups;
    @JdbcTypeCode(SqlTypes.JSON) public JsonNode hollandProfile;
    @JdbcTypeCode(SqlTypes.JSON) public JsonNode benchmarkHistory=com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.arrayNode();
    @JdbcTypeCode(SqlTypes.JSON) public JsonNode admissionDetails=com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode();
    public UUID majorId;
    public UUID schoolId;
    public BigDecimal benchmark;
    public Integer benchmarkYear;
    public String sourceUrl;
    public boolean verified;
    public boolean published;
    @Version public long revision;
}
