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
@SpringBootTest(properties={"app.local-admin-enabled=false","app.seed-enabled=true","spring.datasource.url=${TEST_DATABASE_URL}","spring.datasource.username=${TEST_DATABASE_USERNAME}","spring.datasource.password=${TEST_DATABASE_PASSWORD}"})
@AutoConfigureMockMvc
@EnabledIfEnvironmentVariable(named="LOCAL_POSTGRES_TEST",matches="true")
@Transactional
class LocalPostgresTest {
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired QuizVersionRepository quizzes;
    @Autowired ObjectMapper mapper;
    @Autowired vn.edu.huongnghiep.modules.auth.LocalAccountService accounts;
    @Autowired org.springframework.security.crypto.password.PasswordEncoder encoder;
    @Autowired org.springframework.session.jdbc.JdbcIndexedSessionRepository sessions;
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
    @Test void publicRegistrationHashesPasswordAndCannotChooseAdminRole() throws Exception {
        var username="student_"+UUID.randomUUID().toString().substring(0,8);
        var password="Test-only-password-29";
        var body=Map.of("username",username,"displayName","Học sinh thử","password",password,"role","ADMIN");
        mvc.perform(post("/api/auth/register").with(csrf()).contentType("application/json").content(mapper.writeValueAsString(body)))
            .andExpect(status().isCreated());
        var created=users.findByLocalUsername(username).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(created.role).isEqualTo("STUDENT");
        org.assertj.core.api.Assertions.assertThat(created.googleSubject).isNull();
        org.assertj.core.api.Assertions.assertThat(created.passwordHash).isNotEqualTo(password);
        org.assertj.core.api.Assertions.assertThat(encoder.matches(password,created.passwordHash)).isTrue();
        mvc.perform(post("/api/auth/register").with(csrf()).contentType("application/json").content(mapper.writeValueAsString(Map.of("username",username.toUpperCase(java.util.Locale.ROOT),"displayName","Trùng tên","password",password))))
            .andExpect(status().isConflict());
    }
    @Test void wrongPasswordCannotCreateAuthenticatedSession() throws Exception {
        var username="wrong_"+UUID.randomUUID().toString().substring(0,8);
        accounts.register(new vn.edu.huongnghiep.modules.auth.LocalAccountService.Registration(username,"Thử sai mật khẩu","Correct-test-password"));
        mvc.perform(post("/api/auth/login").with(csrf()).contentType("application/json").content(mapper.writeValueAsString(Map.of("username",username,"password","incorrect-password"))))
            .andExpect(status().isUnauthorized());
    }
    @Test void correctPasswordPersistsSecurityContextAndKeepsStudentOutOfAdmin() throws Exception {
        var username="login_"+UUID.randomUUID().toString().substring(0,8);
        accounts.register(new vn.edu.huongnghiep.modules.auth.LocalAccountService.Registration(username,"Thử đăng nhập","Correct-test-password"));
        var response=mvc.perform(post("/api/auth/login").with(csrf()).contentType("application/json").content(mapper.writeValueAsString(Map.of("username",username.toUpperCase(java.util.Locale.ROOT),"password","Correct-test-password"))))
            .andExpect(status().isOk()).andReturn().getResponse();
        var cookie=response.getCookie("SESSION");
        org.assertj.core.api.Assertions.assertThat(cookie).isNotNull();
        var sessionId=new String(java.util.Base64.getDecoder().decode(cookie.getValue()),java.nio.charset.StandardCharsets.UTF_8);
        org.springframework.session.Session persistedSession=sessions.findById(sessionId);
        var context=(org.springframework.security.core.context.SecurityContext)persistedSession
            .getAttribute(org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
        org.assertj.core.api.Assertions.assertThat(context.getAuthentication().isAuthenticated()).isTrue();
        var principal=(org.springframework.security.core.userdetails.UserDetails)context.getAuthentication().getPrincipal();
        org.assertj.core.api.Assertions.assertThat(principal.getPassword()).isNull();
        mvc.perform(get("/api/users/me").cookie(cookie)).andExpect(status().isOk()).andExpect(jsonPath("$.username").value(username));
        mvc.perform(get("/api/admin/programs").cookie(cookie)).andExpect(status().isForbidden());
        var previous=org.springframework.security.core.context.SecurityContextHolder.getContext();
        try {
            org.springframework.security.core.context.SecurityContextHolder.setContext(context);
            var current=new vn.edu.huongnghiep.modules.auth.CurrentActor(users);
            org.assertj.core.api.Assertions.assertThat(current.require().localUsername).isEqualTo(username);
            org.assertj.core.api.Assertions.assertThatThrownBy(current::admin).isInstanceOf(vn.edu.huongnghiep.shared.ApiException.class);
        } finally { org.springframework.security.core.context.SecurityContextHolder.setContext(previous); }
    }
    @Test void bootstrapNeverOverwritesOrPromotesExistingStudent() {
        var username="existing_"+UUID.randomUUID().toString().substring(0,8);
        accounts.register(new vn.edu.huongnghiep.modules.auth.LocalAccountService.Registration(username,"Học sinh","Student-test-password"));
        accounts.bootstrapAdmin(username,"Replacement-test-password");
        var user=users.findByLocalUsername(username).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(user.role).isEqualTo("STUDENT");
        org.assertj.core.api.Assertions.assertThat(encoder.matches("Student-test-password",user.passwordHash)).isTrue();
    }
}
