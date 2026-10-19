package vn.edu.huongnghiep.shared;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.edu.huongnghiep.infrastructure.persistence.*;

@Service
public class AuditService {
    private final AuditLogRepository repository;
    public AuditService(AuditLogRepository repository) { this.repository = repository; }
    public void record(UUID actorId, String action, Object targetId) {
        var entry = new AuditLogEntity(); entry.id = UUID.randomUUID(); entry.actorId = actorId;
        entry.action = action; entry.targetId = targetId.toString(); entry.createdAt = Instant.now(); repository.save(entry);
    }
}
