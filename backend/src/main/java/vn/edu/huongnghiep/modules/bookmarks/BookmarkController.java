package vn.edu.huongnghiep.modules.bookmarks;

import com.fasterxml.jackson.databind.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import vn.edu.huongnghiep.modules.auth.CurrentActor;

@RestController
@RequestMapping("/api/me/bookmarks")
public class BookmarkController {
    public record Bookmark(@NotBlank @Size(max=255) String id,@Pattern(regexp="career|school") @NotNull String type,
        @NotBlank @Size(max=255) String name,@Size(max=255) String subtitle,@Size(max=100) String tag,@Size(max=30) String color,long savedAt) {}
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final CurrentActor actor;
    public BookmarkController(JdbcTemplate jdbc,ObjectMapper mapper,CurrentActor actor) { this.jdbc=jdbc;this.mapper=mapper;this.actor=actor; }
    @GetMapping
    Object list() {
        return jdbc.query("SELECT data::text FROM bookmarks WHERE user_id = ? ORDER BY item_id",(rs,row)->{
            try { return mapper.readTree(rs.getString(1)); } catch(Exception e) { throw new IllegalStateException(e); }
        },actor.require().id);
    }
    @PostMapping @Transactional
    Object save(@Valid @RequestBody Bookmark r) {
        JsonNode data=mapper.valueToTree(r);
        jdbc.update("INSERT INTO bookmarks(user_id,item_id,data) VALUES (?,?,?::jsonb) ON CONFLICT(user_id,item_id) DO UPDATE SET data = EXCLUDED.data",actor.require().id,r.id(),data.toString());
        return data;
    }
    @DeleteMapping("/{id}") void remove(@PathVariable String id) { jdbc.update("DELETE FROM bookmarks WHERE user_id = ? AND item_id = ?",actor.require().id,id); }
    @DeleteMapping void clear() { jdbc.update("DELETE FROM bookmarks WHERE user_id = ?",actor.require().id); }
}
