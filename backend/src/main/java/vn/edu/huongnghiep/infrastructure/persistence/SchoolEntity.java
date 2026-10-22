package vn.edu.huongnghiep.infrastructure.persistence;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="schools")
public class SchoolEntity {
 @Id public UUID id;
 public String code;
 public String name;
 public String website;
 public boolean active=true;
 @Version public long revision;
 public Instant createdAt=Instant.now();
}
