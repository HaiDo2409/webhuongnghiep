package vn.edu.huongnghiep;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import vn.edu.huongnghiep.modules.careers.SalaryReferenceService;
import static org.assertj.core.api.Assertions.*;

class SalaryReferenceTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test void everyReferenceHasProvenanceAndMatchesAnExistingCareer() throws Exception {
        var service = new SalaryReferenceService(mapper);
        com.fasterxml.jackson.databind.JsonNode reference;
        try (var stream = new ClassPathResource("reference/vn-salary-2026-v1.json").getInputStream()) { reference = mapper.readTree(stream); }
        byte[] workbook;
        try (var stream = new ClassPathResource("seed/careers-source.xlsx").getInputStream()) { workbook = stream.readAllBytes(); }
        var known = new vn.edu.huongnghiep.modules.careers.CareerWorkbookReader().read(workbook, null).rows().stream().map(r -> r.code()).toList();
        for (var rule : reference.path("rules")) for (var code : rule.path("codes")) {
            assertThat(known).contains(code.asText());
            var node = mapper.createObjectNode(); service.supplement(node, code.asText());
            assertThat(node.path("salaryMinVnd").asLong()).isPositive().isLessThanOrEqualTo(node.path("salaryMaxVnd").asLong());
            assertThat(node.path("salaryKind").asText()).isEqualTo("ESTIMATE");
            assertThat(node.path("salaryYear").asInt()).isEqualTo(2026);
            for (String field : new String[]{"salarySourceUrl", "salaryRegion", "salaryExperience", "salaryMethod", "salaryReferenceVersion"})
                assertThat(node.path(field).asText()).isNotBlank();
        }
    }

    @Test void existingSalariesAndUnrelatedProfessionsAreNeverReplaced() throws Exception {
        var service = new SalaryReferenceService(mapper);
        var stored = mapper.createObjectNode().put("salaryMinVnd", 9_000_000).put("salarySourceUrl", "https://example.org/own-source");
        var before = stored.deepCopy(); service.supplement(stored, "15-1252.00");
        assertThat(stored).isEqualTo(before);
        var unrelated = mapper.createObjectNode(); service.supplement(unrelated, "29-1141.00");
        assertThat(unrelated.isEmpty()).isTrue();
        service.supplement(unrelated, "15-1252.99");
        assertThat(unrelated.isEmpty()).isTrue();
    }

    @Test void engineeringAndFoodReferencesKeepTheirDifferentContexts() throws Exception {
        var service = new SalaryReferenceService(mapper);
        var engineering = mapper.createObjectNode(); service.supplement(engineering, "17-2199.05");
        assertThat(engineering.path("salaryMinVnd").asLong()).isEqualTo(18_000_000);
        assertThat(engineering.path("salaryBasis").asText()).isEqualTo("GROSS");
        assertThat(engineering.path("salarySourceUrl").asText()).endsWith("#page=18");
        var food = mapper.createObjectNode(); service.supplement(food, "19-1012.00");
        assertThat(food.path("salaryMinVnd").asLong()).isEqualTo(14_000_000);
        assertThat(food.path("salaryBasis").asText()).isEqualTo("UNSPECIFIED");
        assertThat(food.path("salaryRegion").asText()).contains("Hồ Chí Minh");
        assertThat(food.path("salaryMethod").asText()).contains("một tin tuyển dụng");
        assertThat(food.path("salarySourceUrl").asText()).doesNotContain("#page=");
    }
}
