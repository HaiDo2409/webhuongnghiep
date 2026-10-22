package vn.edu.huongnghiep.modules.careers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

/** Versioned, explicitly estimated references; never overwrite imported career-specific salaries. */
@Service
public class SalaryReferenceService {
    private final JsonNode reference;
    private final Map<String, JsonNode> byCode = new HashMap<>();

    public SalaryReferenceService(ObjectMapper mapper) throws IOException {
        try (var input = new ClassPathResource("reference/vn-salary-2026-v1.json").getInputStream()) {
            reference = mapper.readTree(input);
        }
        for (var rule : reference.path("rules")) {
            if (rule.path("minMillion").asInt() <= 0 || rule.path("maxMillion").asInt() < rule.path("minMillion").asInt())
                throw new IllegalStateException("Invalid salary reference range");
            for (var code : rule.path("codes")) {
                if (byCode.putIfAbsent(code.asText(), rule) != null)
                    throw new IllegalStateException("Duplicate salary reference: " + code.asText());
            }
        }
    }

    public void supplement(ObjectNode career, String onetCode) {
        // Partial existing salary data also stays untouched; do not mix two sources.
        if (career.hasNonNull("salaryMinVnd") || career.hasNonNull("salaryMaxVnd")) return;
        var rule = byCode.get(onetCode);
        if (rule == null) return; // No guesses for unrelated professions or unknown codes.
        career.put("salaryMinVnd", rule.path("minMillion").asLong() * 1_000_000L);
        career.put("salaryMaxVnd", rule.path("maxMillion").asLong() * 1_000_000L);
        career.put("salaryPeriod", "MONTH");
        career.put("salaryKind", "ESTIMATE");
        career.put("salaryRegion", value(rule, "region"));
        career.put("salaryYear", reference.path("year").asInt());
        career.put("salaryExperience", value(rule, "experience"));
        career.put("salaryBasis", rule.path("basis").asText("GROSS"));
        career.put("salaryReferenceRole", rule.path("role").asText());
        career.put("salarySourceName", value(rule, "sourceName"));
        career.put("salarySourceUrl", value(rule, "sourceUrl") + (rule.has("page") ? "#page=" + rule.path("page").asInt() : ""));
        career.put("salaryMethod", value(rule, "method"));
        career.put("salaryReferenceVersion", reference.path("version").asText());
        career.put("salaryRetrievedAt", reference.path("retrievedAt").asText());
    }

    private String value(JsonNode rule, String key) {
        return rule.path(key).asText(reference.path(key).asText());
    }
}
