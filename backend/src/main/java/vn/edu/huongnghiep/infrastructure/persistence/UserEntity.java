package vn.edu.huongnghiep.infrastructure.persistence;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.UUID;
import java.time.Instant;
import java.math.BigDecimal;

@Entity
@Table(name="app_users")
public class UserEntity {
    @Id public UUID id;
    @Column(nullable=false, unique=true) public String googleSubject;
    public String email;
    public String displayName;
    public String avatarUrl;
    public String role;
    public boolean active;
    public Instant createdAt;
}
