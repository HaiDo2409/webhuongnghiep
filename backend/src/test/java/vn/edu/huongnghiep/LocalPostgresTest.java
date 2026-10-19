package vn.edu.huongnghiep;

import com.fasterxml.jackson.databind.*;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import vn.edu.huongnghiep.infrastructure.persistence.*;

/** Explicit opt-in; always point TEST_DATABASE_URL at a dedicated test database. Transactions roll back test data. */
@SpringBootTest(properties={"app.seed-enabled=true","spring.datasource.url=${TEST_DATABASE_URL}","spring.datasource.username=${TEST_DATABASE_USERNAME}","spring.datasource.password=${TEST_DATABASE_PASSWORD}"})
@AutoConfigureMockMvc
@EnabledIfEnvironmentVariable(named="LOCAL_POSTGRES_TEST",matches="true")
@Transactional
class LocalPostgresTest {
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired QuizVersionRepository quizzes;
    @Autowired ObjectMapper mapper;
    private String subject;
    @BeforeEach void admin() {
        var u=new UserEntity();u.id=UUID.randomUUID();u.googleSubject="test-"+UUID.randomUUID();u.email="test@example.invalid";
        u.displayName="Test admin";u.role="ADMIN";u.active=true;u.createdAt=Instant.now();users.saveAndFlush(u);subject=u.googleSubject;
    }
    @Test void adminCanCreateAndUpdateProgramWithOptimisticVersion() throws Exception {
        var request=mapper.createObjectNode();request.put("school","Trường thử");request.put("shortName","TEST");request.put("major","Ngành thử");request.put("majorCode","001");request.put("admissionYear",2026);
        request.set("subjectGroups",mapper.valueToTree(List.of(Map.of("code","A00","subjects",List.of("toan","ly","hoa")))));
        request.set("hollandProfile",mapper.valueToTree(Map.of("I",100)));request.put("published",true);request.put("verified",false);request.put("revision",0);
        var body=mvc.perform(post("/api/admin/programs").with(oidcLogin().idToken(t->t.subject(subject))).with(csrf()).contentType("application/json").content(request.toString()))
            .andExpect(status().isOk()).andExpect(jsonPath("$.major").value("Ngành thử")).andReturn().getResponse().getContentAsString();
        JsonNode created=mapper.readTree(body);request.put("major","Ngành đã sửa");
        mvc.perform(put("/api/admin/programs/"+created.path("id").asText()).with(oidcLogin().idToken(t->t.subject(subject))).with(csrf()).contentType("application/json").content(request.toString()))
            .andExpect(status().isOk()).andExpect(jsonPath("$.revision").value(1));
        mvc.perform(put("/api/admin/programs/"+created.path("id").asText()).with(oidcLogin().idToken(t->t.subject(subject))).with(csrf()).contentType("application/json").content(request.toString()))
            .andExpect(status().isConflict());
    }
    @Test void studentCannotManageProgramsEvenWithValidCSRF() throws Exception {
        var user=users.findByGoogleSubject(subject).orElseThrow();user.role="STUDENT";users.saveAndFlush(user);
        mvc.perform(get("/api/admin/programs").with(oidcLogin().idToken(t->t.subject(subject)))).andExpect(status().isForbidden());
    }
    @Test void publishedQuizCanBeReplacedWithoutEditingOldQuestions() throws Exception {
        var previous=quizzes.findByStatusOrderByQuizType("PUBLISHED").stream().filter(q->q.quizType.equals("HOLLAND")).findFirst().orElseThrow();
        var request=Map.of("type","HOLLAND","title","Phiên bản thử","questions",previous.questions);
        var body=mvc.perform(post("/api/admin/quizzes").with(oidcLogin().idToken(t->t.subject(subject))).with(csrf()).contentType("application/json").content(mapper.writeValueAsString(request)))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        var draft=mapper.readTree(body);
        mvc.perform(post("/api/admin/quizzes/"+draft.path("id").asText()+"/publish").with(oidcLogin().idToken(t->t.subject(subject))).with(csrf()).contentType("application/json").content("{\"revision\":0}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("PUBLISHED"));
    }
    @Test void bookmarksAreScopedToCurrentUser() throws Exception {
        mvc.perform(post("/api/me/bookmarks").with(oidcLogin().idToken(t->t.subject(subject))).with(csrf()).contentType("application/json")
            .content("{\"id\":\"career-test\",\"type\":\"career\",\"name\":\"Nghề thử\",\"savedAt\":100}"))
            .andExpect(status().isOk());
        mvc.perform(get("/api/me/bookmarks").with(oidcLogin().idToken(t->t.subject(subject)))).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
    }
}
