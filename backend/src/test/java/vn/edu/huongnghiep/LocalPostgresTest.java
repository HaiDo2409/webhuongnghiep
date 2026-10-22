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
    @Autowired jakarta.persistence.EntityManager entityManager;
    @Autowired ObjectMapper mapper;
    @Autowired vn.edu.huongnghiep.modules.auth.LocalAccountService accounts;
    @Autowired org.springframework.security.crypto.password.PasswordEncoder encoder;
    @Autowired org.springframework.session.jdbc.JdbcIndexedSessionRepository sessions;
    @Autowired vn.edu.huongnghiep.modules.careers.CareerImportService careerImports;
    @Autowired vn.edu.huongnghiep.infrastructure.persistence.CareerRepository careerRecords;
    @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;
    @Autowired vn.edu.huongnghiep.modules.careers.CareerCatalogService careerCatalog;
    private String subject;
    private org.springframework.test.web.servlet.request.RequestPostProcessor localLogin() {
        return user(users.findByLocalUsername(subject).orElseThrow().id.toString());
    }
    private jakarta.servlet.http.Cookie passwordLogin(String username,String password)throws Exception {
        return mvc.perform(post("/api/auth/login").with(csrf()).contentType("application/json")
            .content(mapper.writeValueAsString(Map.of("username",username,"password",password))))
            .andExpect(status().isOk()).andReturn().getResponse().getCookie("SESSION");
    }
    @Test void salaryReferencesWorkForExistingRecordsAndFilteringWithoutChangingStoredData()throws Exception {
        var stored = careerRecords.findByOnetCode("17-2199.05").orElseThrow();
        var before = stored.data.deepCopy();
        mvc.perform(get("/api/career-catalog").param("q","17-2199.05").param("salary","25"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1))
            .andExpect(jsonPath("$.items[0].salaryKind").value("ESTIMATE"))
            .andExpect(jsonPath("$.items[0].salaryMaxVnd").value(30000000));
        mvc.perform(get("/api/career-catalog").param("q","17-2199.05").param("salary","50"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(0));
        mvc.perform(get("/api/career-catalog/"+stored.id)).andExpect(status().isOk())
            .andExpect(jsonPath("$.salarySourceUrl").isNotEmpty()).andExpect(jsonPath("$.salaryBasis").value("GROSS"));
        entityManager.flush();entityManager.clear();
        org.assertj.core.api.Assertions.assertThat(careerRecords.findById(stored.id).orElseThrow().data).isEqualTo(before);
    }
    @Test void studentsAndAdminsCanChangePasswordAndBothExistingSessionsAreRevoked()throws Exception {
        for(String role:List.of("STUDENT","ADMIN")) {
            String username="change_"+UUID.randomUUID().toString().substring(0,8),oldPassword="Original-test-password",newPassword="Updated-test-password";
            if(role.equals("ADMIN"))accounts.bootstrapAdmin(username,oldPassword);
            else accounts.register(new vn.edu.huongnghiep.modules.auth.LocalAccountService.Registration(username,"Đổi mật khẩu",oldPassword));
            var user=users.findByLocalUsername(username).orElseThrow();
            var first=passwordLogin(username,oldPassword);var second=passwordLogin(username,oldPassword);
            mvc.perform(get("/api/me/password").cookie(first)).andExpect(status().isOk()).andExpect(jsonPath("$.canChangePassword").value(true));
            var body=mapper.writeValueAsString(Map.of("currentPassword",oldPassword,"newPassword",newPassword,"confirmPassword",newPassword));
            mvc.perform(post("/api/me/password").cookie(first).with(csrf()).contentType("application/json").content(body)).andExpect(status().isOk());
            org.assertj.core.api.Assertions.assertThat(encoder.matches(newPassword,users.findById(user.id).orElseThrow().passwordHash)).isTrue();
            for(var cookie:List.of(first,second))mvc.perform(get("/api/me/profile").cookie(cookie)).andExpect(status().isUnauthorized());
            mvc.perform(post("/api/auth/login").with(csrf()).contentType("application/json").content(mapper.writeValueAsString(Map.of("username",username,"password",oldPassword)))).andExpect(status().isUnauthorized());
            var changed=passwordLogin(username,newPassword);
            mvc.perform(get("/api/users/me").cookie(changed)).andExpect(status().isOk()).andExpect(jsonPath("$.roles[0]").value(role));
            entityManager.flush();
            org.assertj.core.api.Assertions.assertThat(jdbc.queryForObject("select count(*) from audit_logs where actor_id=? and action='PASSWORD_CHANGED'",Long.class,user.id)).isEqualTo(1);
        }
    }
    @Test void invalidPasswordChangesKeepOriginalPasswordAndSession()throws Exception {
        String username="invalid_"+UUID.randomUUID().toString().substring(0,8),original="Original-test-password";
        accounts.register(new vn.edu.huongnghiep.modules.auth.LocalAccountService.Registration(username,"Kiểm tra mật khẩu",original));
        var cookie=passwordLogin(username,original);
        for(var body:List.of(
            Map.of("currentPassword","incorrect-password","newPassword","New-test-password","confirmPassword","New-test-password"),
            Map.of("currentPassword",original,"newPassword","New-test-password","confirmPassword","Mismatch-password"),
            Map.of("currentPassword",original,"newPassword",original,"confirmPassword",original),
            Map.of("currentPassword",original,"newPassword","short","confirmPassword","short"),
            Map.of("currentPassword",original,"newPassword","đ".repeat(37),"confirmPassword","đ".repeat(37)))) {
            mvc.perform(post("/api/me/password").cookie(cookie).with(csrf()).contentType("application/json").content(mapper.writeValueAsString(body))).andExpect(status().isUnprocessableEntity());
        }
        mvc.perform(get("/api/me/profile").cookie(cookie)).andExpect(status().isOk());
        passwordLogin(username,original);
    }
    @Test void passwordChangeRequiresAuthenticationCsrfAndAnExistingLocalPassword()throws Exception {
        var body=mapper.writeValueAsString(Map.of("currentPassword","Current-test-password","newPassword","New-test-password","confirmPassword","New-test-password"));
        mvc.perform(get("/api/me/password")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/me/password").with(csrf()).contentType("application/json").content(body)).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/me/password").with(localLogin()).contentType("application/json").content(body)).andExpect(status().isForbidden());
        mvc.perform(get("/api/me/password").with(localLogin())).andExpect(status().isOk()).andExpect(jsonPath("$.canChangePassword").value(true));
        mvc.perform(post("/api/me/password").with(localLogin()).with(csrf()).contentType("application/json").content(body)).andExpect(status().isUnprocessableEntity());
    }
    private JsonNode recommendationPage(com.fasterxml.jackson.databind.node.ObjectNode request,int offset)throws Exception {
        var page=request.with("page");page.put("offset",offset).put("limit",15);
        return mapper.readTree(mvc.perform(post("/api/recommendations").with(csrf()).contentType("application/json").content(request.toString()))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
    }
    @Test void pagedSearchMatchesFullRankingAndFiltersBeforePagination()throws Exception {
        var input=(com.fasterxml.jackson.databind.node.ObjectNode)mapper.readTree("{\"year\":2026,\"mode\":\"POINTS\",\"scores\":{\"toan\":9,\"ly\":9,\"hoa\":9},\"priority\":{\"region\":\"KV1\",\"category\":\"NONE\",\"graduationYear\":2026}}");
        var all=mapper.readTree(mvc.perform(post("/api/recommendations").with(csrf()).contentType("application/json").content(input.toString())).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        var first=recommendationPage(input,0);var second=recommendationPage(input,15);
        org.assertj.core.api.Assertions.assertThat(first.path("items").size()).isEqualTo(15);
        org.assertj.core.api.Assertions.assertThat(first.path("total")).isEqualTo(all.path("total"));
        for(int i=0;i<15;i++) {
            org.assertj.core.api.Assertions.assertThat(first.path("items").get(i)).isEqualTo(all.path("items").get(i));
            org.assertj.core.api.Assertions.assertThat(second.path("items").get(i)).isEqualTo(all.path("items").get(i+15));
        }
        String major=all.path("items").get(25).path("program").path("major").asText();
        input.with("page").put("major",major).put("verifiedOnly",false);
        var filtered=recommendationPage(input,0);int count=0;
        for(var row:all.path("items"))if(row.path("program").path("major").asText().toLowerCase(Locale.ROOT).contains(major.toLowerCase(Locale.ROOT)))count++;
        org.assertj.core.api.Assertions.assertThat(filtered.path("total").asInt()).isEqualTo(count);
        String program=all.path("items").get(25).path("program").path("id").asText();input.with("page").put("programId",program);
        var exact=recommendationPage(input,0);org.assertj.core.api.Assertions.assertThat(exact.path("total").asInt()).isEqualTo(1);
        org.assertj.core.api.Assertions.assertThat(exact.path("items").get(0)).isEqualTo(all.path("items").get(25));
        var beyond=recommendationPage(input,1000000);org.assertj.core.api.Assertions.assertThat(beyond.path("items").size()).isZero();
        org.assertj.core.api.Assertions.assertThat(beyond.path("hasMore").asBoolean()).isFalse();
        input.with("page").remove(List.of("major","programId"));input.with("page").put("verifiedOnly",true);
        var verified=recommendationPage(input,0);int verifiedCount=0;
        for(var row:all.path("items"))if(row.path("program").path("verified").asBoolean())verifiedCount++;
        org.assertj.core.api.Assertions.assertThat(verified.path("total").asInt()).isEqualTo(verifiedCount);
        for(var row:all.path("items"))if(row.path("program").path("admissionDetails").path("calculationSupported").isBoolean()&&!row.path("program").path("admissionDetails").path("calculationSupported").asBoolean()) {
            input.with("page").put("verifiedOnly",false).put("programId",row.path("program").path("id").asText());
            org.assertj.core.api.Assertions.assertThat(recommendationPage(input,0).path("items").get(0)).isEqualTo(row);break;
        }
    }
    @Test void pagedHollandMatchesFullRankingAndStillChecksGuestOwnership()throws Exception {
        var quiz=quizzes.findByStatusOrderByQuizType("PUBLISHED").stream().filter(q->q.quizType.equals("HOLLAND")).findFirst().orElseThrow();
        var answers=new LinkedHashMap<Integer,Integer>();quiz.questions.forEach(q->answers.put(q.path("id").asInt(),1+q.path("id").asInt()%5));
        var submission=mvc.perform(post("/api/quiz-results").with(csrf()).contentType("application/json")
            .content(mapper.writeValueAsString(Map.of("quizVersionId",quiz.id,"answers",answers)))).andExpect(status().isOk()).andReturn().getResponse();
        var result=mapper.readTree(submission.getContentAsString());
        var guestCookie=submission.getCookie("SESSION");
        org.assertj.core.api.Assertions.assertThat(guestCookie).isNotNull();
        for(String mode:List.of("INTEREST","COMBINED")) {
            var input=mapper.createObjectNode().put("year",2026).put("mode",mode).put("quizResultId",result.path("id").asText());input.set("scores",mapper.valueToTree(Map.of("toan",9,"ly",8,"hoa",7)));
            var full=mapper.readTree(mvc.perform(post("/api/recommendations").cookie(guestCookie).with(csrf()).contentType("application/json").content(input.toString())).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
            input.set("page",mapper.valueToTree(Map.of("offset",0,"limit",15)));
            var paged=mapper.readTree(mvc.perform(post("/api/recommendations").cookie(guestCookie).with(csrf()).contentType("application/json").content(input.toString())).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
            for(int i=0;i<15;i++)org.assertj.core.api.Assertions.assertThat(paged.path("items").get(i)).isEqualTo(full.path("items").get(i));
            mvc.perform(post("/api/recommendations").with(csrf()).contentType("application/json").content(input.toString())).andExpect(status().isNotFound());
        }
    }
    @Test void pagingLimitsAreValidatedAndMorePagesDoNotWriteAdditionalHistory()throws Exception {
        mvc.perform(post("/api/recommendations").with(csrf()).contentType("application/json").content("{\"year\":2026,\"mode\":\"POINTS\",\"scores\":{},\"page\":{\"offset\":-1,\"limit\":500}}"))
            .andExpect(status().isUnprocessableEntity());
        var user=users.findByLocalUsername(subject).orElseThrow();
        for(int offset:List.of(0,15)) {
            var request=Map.of("year",2026,"mode","POINTS","scores",Map.of("toan",9,"ly",9,"hoa",9),"page",Map.of("offset",offset,"limit",15));
            mvc.perform(post("/api/recommendations").with(localLogin()).with(csrf()).contentType("application/json").content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(15));
        }
        entityManager.flush();
        org.assertj.core.api.Assertions.assertThat(jdbc.queryForObject("select count(*) from recommendation_runs where user_id=?",Long.class,user.id)).isEqualTo(1);
        org.assertj.core.api.Assertions.assertThat(jdbc.queryForObject("select jsonb_array_length(result_snapshot) from recommendation_runs where user_id=?",Integer.class,user.id)).isEqualTo(15);
    }
    @Test void fastMatchingUsesSharedTagsEvenWithLegacyModesAndExclusions()throws Exception {
        var matcher=new vn.edu.huongnghiep.modules.careers.TagProgramMatcher(jdbc,null,null);
        var career=careerRecords.findByOnetCode("15-1252.00").orElseThrow();
        for(String mode:List.of("TAG","EXPLICIT","MAJOR")) {
            jdbc.update("update careers set data=jsonb_set(data,'{programLinkMode}',to_jsonb(?::text)) where id=?",mode,career.id);
            var expected=matcher.publicPrograms(career.id).stream().map(row->(UUID)row.get("id")).collect(java.util.stream.Collectors.toSet());
            var actual=matcher.publicPairs().stream().filter(row->row.get("career_id").equals(career.id)).map(row->(UUID)row.get("id")).collect(java.util.stream.Collectors.toSet());
            org.assertj.core.api.Assertions.assertThat(actual).isEqualTo(expected);
            if(!expected.isEmpty()) {
                var id=expected.iterator().next();
                jdbc.update("insert into career_program_decisions(career_id,program_id,decision) values (?,?,'EXCLUDE') on conflict(career_id,program_id) do update set decision='EXCLUDE'",career.id,id);
                org.assertj.core.api.Assertions.assertThat(matcher.publicPairs().stream().filter(row->row.get("career_id").equals(career.id)).map(row->(UUID)row.get("id"))).doesNotContain(id);
            }
        }
    }
    private JsonNode createSchool(boolean active)throws Exception{
        String code="SCHOOL_"+UUID.randomUUID().toString().replace("-","");
        return mapper.readTree(mvc.perform(post("/api/admin/schools").with(localLogin()).with(csrf()).contentType("application/json").content(mapper.writeValueAsString(Map.of("code",code,"name","Trường kiểm thử quản lý","website","https://example.edu.vn","active",active)))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
    }
    @Test void adminCanCreateEditAndDeleteAnEmptySchoolWithDuplicateAndRevisionChecks()throws Exception{
        var s=createSchool(true);String path="/api/admin/schools/"+s.path("id").asText();
        mvc.perform(get("/api/schools/"+s.path("code").asText()+"/programs")).andExpect(status().isOk()).andExpect(jsonPath("$.programs.length()").value(0));
        mvc.perform(post("/api/admin/schools").with(localLogin()).with(csrf()).contentType("application/json").content(s.toString())).andExpect(status().isConflict());
        var input=(com.fasterxml.jackson.databind.node.ObjectNode)s.deepCopy();input.put("name","Tên trường đã chỉnh sửa");
        var saved=mapper.readTree(mvc.perform(put(path).with(localLogin()).with(csrf()).contentType("application/json").content(input.toString())).andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Tên trường đã chỉnh sửa")).andReturn().getResponse().getContentAsString());
        mvc.perform(delete(path).param("revision",s.path("revision").asText()).with(localLogin()).with(csrf())).andExpect(status().isConflict());
        mvc.perform(delete(path).param("revision",saved.path("revision").asText()).with(localLogin()).with(csrf())).andExpect(status().isNoContent());
        mvc.perform(get("/api/schools/"+s.path("code").asText()+"/programs")).andExpect(status().isNotFound());
    }
    @Test void hidingSchoolRemovesProgramsFromAllPublicPathsAndRestorePreservesPublicationFlags()throws Exception{
        var s=mapper.readTree(mvc.perform(get("/api/admin/schools").with(localLogin())).andReturn().getResponse().getContentAsString());JsonNode school=null;for(var x:s)if(x.path("code").asText().equals("UET"))school=x;
        org.assertj.core.api.Assertions.assertThat(school).isNotNull();String path="/api/admin/schools/"+school.path("id").asText();
        long before=jdbc.queryForObject("select count(*) from programs where school_id=? and published",Long.class,UUID.fromString(school.path("id").asText()));
        var input=(com.fasterxml.jackson.databind.node.ObjectNode)school.deepCopy();input.put("active",false);
        var hidden=mapper.readTree(mvc.perform(put(path).with(localLogin()).with(csrf()).contentType("application/json").content(input.toString())).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        mvc.perform(get("/api/schools/UET/programs")).andExpect(status().isNotFound());
        mvc.perform(get("/api/programs")).andExpect(status().isOk()).andExpect(jsonPath("$[?(@.shortName=='UET')]").isEmpty());
        mvc.perform(get("/api/career-catalog/onet-15-1252.00")).andExpect(status().isOk()).andExpect(jsonPath("$.programs[?(@.short_name=='UET')]").isEmpty());
        mvc.perform(post("/api/recommendations").with(csrf()).contentType("application/json").content("{\"year\":2026,\"mode\":\"POINTS\",\"scores\":{\"toan\":9,\"ly\":9,\"hoa\":9}}")).andExpect(status().isOk()).andExpect(jsonPath("$.items[?(@.program.shortName=='UET')]").isEmpty());
        mvc.perform(delete(path).param("revision",hidden.path("revision").asText()).with(localLogin()).with(csrf())).andExpect(status().isConflict());
        org.assertj.core.api.Assertions.assertThat(jdbc.queryForObject("select count(*) from programs where school_id=? and published",Long.class,UUID.fromString(school.path("id").asText()))).isEqualTo(before);
        input.put("active",true).put("revision",hidden.path("revision").asLong());
        mvc.perform(put(path).with(localLogin()).with(csrf()).contentType("application/json").content(input.toString())).andExpect(status().isOk());
        mvc.perform(get("/api/schools/UET/programs")).andExpect(status().isOk()).andExpect(jsonPath("$.programs.length()").value((int)before));
    }
    @Test void newProgramsUseSchoolIdAndCannotExposeAHiddenSchool()throws Exception{
        var s=createSchool(false);var request=mapper.createObjectNode();request.put("schoolId",s.path("id").asText());request.put("school",s.path("name").asText());request.put("shortName",s.path("code").asText());request.put("major","Ngành kiểm thử liên kết trường");request.put("majorCode","TEST");request.put("admissionYear",2026);request.put("published",true);request.set("hollandProfile",mapper.createObjectNode());request.set("subjectGroups",mapper.valueToTree(List.of(Map.of("code","A00","subjects",List.of("toan","ly","hoa")))));
        var p=mapper.readTree(mvc.perform(post("/api/admin/programs").with(localLogin()).with(csrf()).contentType("application/json").content(request.toString())).andExpect(status().isOk()).andExpect(jsonPath("$.schoolId").value(s.path("id").asText())).andReturn().getResponse().getContentAsString());
        org.assertj.core.api.Assertions.assertThat(jdbc.queryForObject("select count(*) from programs where school_id=?",Long.class,UUID.fromString(s.path("id").asText()))).isEqualTo(1);
        mvc.perform(get("/api/programs")).andExpect(status().isOk()).andExpect(jsonPath("$[?(@.id=='"+p.path("id").asText()+"')]").isEmpty());
        mvc.perform(delete("/api/admin/schools/"+s.path("id").asText()).param("revision",s.path("revision").asText()).with(localLogin()).with(csrf())).andExpect(status().isConflict());
        var rename=(com.fasterxml.jackson.databind.node.ObjectNode)s.deepCopy();rename.put("name","Trường đổi tên nhưng giữ chương trình");
        mvc.perform(put("/api/admin/schools/"+s.path("id").asText()).with(localLogin()).with(csrf()).contentType("application/json").content(rename.toString())).andExpect(status().isOk());
        org.assertj.core.api.Assertions.assertThat(jdbc.queryForObject("select school from programs where id=?",String.class,UUID.fromString(p.path("id").asText()))).isEqualTo("Trường đổi tên nhưng giữ chương trình");
        entityManager.clear();
        mvc.perform(put("/api/admin/programs/"+p.path("id").asText()).with(localLogin()).with(csrf()).contentType("application/json").content(p.toString())).andExpect(status().isConflict());
    }
    @Test void schoolManagementRequiresAdminAndCsrf()throws Exception{
        mvc.perform(get("/api/admin/schools")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/admin/schools").with(localLogin()).contentType("application/json").content("{}")).andExpect(status().isForbidden());
        var user=users.findByLocalUsername(subject).orElseThrow();user.role="STUDENT";users.saveAndFlush(user);
        mvc.perform(get("/api/admin/schools").with(localLogin())).andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/schools").with(localLogin()).with(csrf()).contentType("application/json").content("{}")).andExpect(status().isForbidden());
        mvc.perform(delete("/api/admin/schools/"+UUID.randomUUID()).param("revision","0").with(localLogin()).with(csrf())).andExpect(status().isForbidden());
    }
    private UUID createTestTag(String name) throws Exception {
        String value=mvc.perform(post("/api/admin/tags").with(localLogin()).with(csrf()).contentType("application/json").content(mapper.writeValueAsString(Map.of("code","TEST_"+UUID.randomUUID().toString().replace("-",""),"name",name,"active",true)))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return UUID.fromString(mapper.readTree(value).path("id").asText());
    }
    private void assignTags(String type,String id,long revision,List<UUID> ids) throws Exception {
        mvc.perform(post("/api/admin/tag-assignments").with(localLogin()).with(csrf()).contentType("application/json").content(mapper.writeValueAsString(Map.of("type",type,"targetId",id,"revision",revision,"tagIds",ids)))).andExpect(status().isOk());
    }
    @Test void sharedTagsMatchByStableIdAndCoverageIsSeparateFromHolland() throws Exception {
        var c=careerRecords.findByOnetCode("15-1252.00").orElseThrow();UUID p=vn.edu.huongnghiep.modules.careers.CatalogSupplementService.programId("UET_CN8");
        jdbc.update("delete from career_program_links where career_id=?",c.id);
        UUID a=createTestTag("Lập trình kiểm thử "+UUID.randomUUID()),b=createTestTag("Dữ liệu kiểm thử "+UUID.randomUUID());
        assignTags("CAREER",c.id,0,List.of(a,b));assignTags("PROGRAM",p.toString(),0,List.of(a));
        mvc.perform(get("/api/career-catalog/"+c.id)).andExpect(status().isOk()).andExpect(jsonPath("$.programs.length()").value(1)).andExpect(jsonPath("$.programs[0].id").value(p.toString())).andExpect(jsonPath("$.programs[0].tag_coverage").value(50.0)).andExpect(jsonPath("$.fit.score").doesNotExist());
        assignTags("PROGRAM",p.toString(),1,List.of(a,b));
        mvc.perform(get("/api/career-catalog/"+c.id)).andExpect(status().isOk()).andExpect(jsonPath("$.programs[0].tag_coverage").value(100.0));
        assignTags("PROGRAM",p.toString(),2,List.of());
        mvc.perform(get("/api/career-catalog/"+c.id)).andExpect(status().isOk()).andExpect(jsonPath("$.programs.length()").value(0));
    }
    @Test void exclusionOverridesSharedTagsAndResetRestoresAutomaticSuggestion() throws Exception {
        var c=careerRecords.findByOnetCode("15-1252.00").orElseThrow();UUID p=vn.edu.huongnghiep.modules.careers.CatalogSupplementService.programId("UET_CN8");UUID tag=createTestTag("Ngoại lệ liên kết "+UUID.randomUUID());
        assignTags("CAREER",c.id,0,List.of(tag));assignTags("PROGRAM",p.toString(),0,List.of(tag));
        jdbc.update("insert into career_program_links(career_id,program_id) values (?,?) on conflict do nothing",c.id,p);
        String path="/api/admin/careers/"+c.id+"/program-decisions";
        var body=mapper.createObjectNode().put("programId",p.toString()).put("decision","EXCLUDE").put("revision",1);
        mvc.perform(post(path).with(localLogin()).with(csrf()).contentType("application/json").content(body.toString())).andExpect(status().isOk());
        mvc.perform(get("/api/career-catalog/"+c.id)).andExpect(status().isOk()).andExpect(jsonPath("$.programs.length()").value(0));
        mvc.perform(post(path).with(localLogin()).with(csrf()).contentType("application/json").content(body.toString())).andExpect(status().isConflict());
        body.put("decision","RESET").put("revision",2);
        mvc.perform(post(path).with(localLogin()).with(csrf()).contentType("application/json").content(body.toString())).andExpect(status().isOk());
        mvc.perform(get("/api/career-catalog/"+c.id)).andExpect(status().isOk()).andExpect(jsonPath("$.programs.length()").value(1)).andExpect(jsonPath("$.programs[0].previously_confirmed").value(false));
        assignTags("PROGRAM",p.toString(),1,List.of());body.put("decision","INCLUDE").put("revision",3);
        mvc.perform(post(path).with(localLogin()).with(csrf()).contentType("application/json").content(body.toString())).andExpect(status().isUnprocessableEntity());
        jdbc.update("insert into career_program_decisions(career_id,program_id,decision) values (?,?,'INCLUDE')",c.id,p);
        jdbc.update("insert into career_program_links(career_id,program_id) values (?,?) on conflict do nothing",c.id,p);
        mvc.perform(get("/api/career-catalog/"+c.id)).andExpect(status().isOk()).andExpect(jsonPath("$.programs.length()").value(0));
        assignTags("PROGRAM",p.toString(),2,List.of(tag));
        mvc.perform(get("/api/career-catalog/"+c.id)).andExpect(status().isOk()).andExpect(jsonPath("$.programs.length()").value(1));
        jdbc.update("update programs set published=false where id=?",p);
        mvc.perform(get("/api/career-catalog/"+c.id)).andExpect(status().isOk()).andExpect(jsonPath("$.programs.length()").value(0));
    }
    @Test void tagPermissionsUniquenessDeactivationAndAssignmentConflicts() throws Exception {
        mvc.perform(get("/api/admin/tags")).andExpect(status().isUnauthorized());
        String name="Tag chung "+UUID.randomUUID();UUID tag=createTestTag(name);
        mvc.perform(post("/api/admin/tags").with(localLogin()).with(csrf()).contentType("application/json").content(mapper.writeValueAsString(Map.of("code","DUP_"+UUID.randomUUID().toString().replace("-",""),"name",name.toUpperCase(Locale.ROOT),"active",true)))).andExpect(status().isConflict());
        var c=careerRecords.findByOnetCode("15-1252.00").orElseThrow();assignTags("CAREER",c.id,0,List.of(tag));
        mvc.perform(post("/api/admin/tag-assignments").with(localLogin()).with(csrf()).contentType("application/json").content(mapper.writeValueAsString(Map.of("type","CAREER","targetId",c.id,"revision",0,"tagIds",List.of())))).andExpect(status().isConflict());
        var row=jdbc.queryForMap("select code,revision from catalog_tags where id=?",tag);
        mvc.perform(post("/api/admin/tags").with(localLogin()).with(csrf()).contentType("application/json").content(mapper.writeValueAsString(Map.of("id",tag,"code",row.get("code"),"name",name,"active",false,"revision",row.get("revision"))))).andExpect(status().isOk());
        mvc.perform(post("/api/admin/tag-assignments").with(localLogin()).with(csrf()).contentType("application/json").content(mapper.writeValueAsString(Map.of("type","CAREER","targetId",c.id,"revision",1,"tagIds",List.of(tag))))).andExpect(status().isUnprocessableEntity());
        var user=users.findByLocalUsername(subject).orElseThrow();user.role="STUDENT";users.saveAndFlush(user);
        mvc.perform(get("/api/admin/tags").with(localLogin())).andExpect(status().isForbidden());
    }
    @Test void careerCreationNeedsNoManualIndustryOrProgramAndOnlyTagsProduceMatches() throws Exception {
        var body=mapper.createObjectNode().put("onetCode","99-9999.01").put("hollandCode","IRC").put("nameEn","Tag-only test career").put("nameVi","Nghề kiểm thử theo tag").put("description","Nghề kiểm thử tự ghép chương trình theo tag.").put("published",true);
        body.set("groups",mapper.valueToTree(List.of("Nhóm kiểm thử")));body.set("stemGroups",mapper.valueToTree(List.of("T")));
        UUID p=vn.edu.huongnghiep.modules.careers.CatalogSupplementService.programId("UET_CN8");
        // Obsolete fields from an older client cannot establish a direct link or a different matching mode.
        body.put("programLinkMode","EXPLICIT");body.set("programIds",mapper.valueToTree(List.of(p)));body.set("majorIds",mapper.valueToTree(List.of(UUID.randomUUID())));
        var saved=mapper.readTree(mvc.perform(post("/api/admin/careers").with(localLogin()).with(csrf()).contentType("application/json").content(body.toString())).andExpect(status().isOk()).andExpect(jsonPath("$.programLinkMode").value("TAG")).andReturn().getResponse().getContentAsString());
        String id=saved.path("id").asText();
        mvc.perform(get("/api/career-catalog/"+id)).andExpect(status().isOk()).andExpect(jsonPath("$.programs.length()").value(0));
        UUID tag=createTestTag("Tự ghép ngành "+UUID.randomUUID());assignTags("CAREER",id,0,List.of(tag));assignTags("PROGRAM",p.toString(),0,List.of(tag));
        mvc.perform(get("/api/career-catalog/"+id)).andExpect(status().isOk()).andExpect(jsonPath("$.programs.length()").value(1)).andExpect(jsonPath("$.programs[0].id").value(p.toString()));
        jdbc.update("update careers set published=false where id<>?",id);
        org.assertj.core.api.Assertions.assertThat(careerCatalog.programCompatibility(Map.of("I",100d,"R",50d,"C",30d)).keySet()).containsExactly(p);
        assignTags("PROGRAM",p.toString(),1,List.of());
        mvc.perform(get("/api/career-catalog/"+id)).andExpect(status().isOk()).andExpect(jsonPath("$.programs.length()").value(0));
        org.assertj.core.api.Assertions.assertThat(careerCatalog.programCompatibility(Map.of("I",100d,"R",50d,"C",30d))).isEmpty();
    }
    @Test void editingCareerPreservesImportedIndustryInformationAndStillRequiresAdmin() throws Exception {
        mvc.perform(get("/api/admin/careers/options")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/admin/careers").with(localLogin()).contentType("application/json").content("{}")).andExpect(status().isForbidden());
        var c=careerRecords.findByOnetCode("15-1252.00").orElseThrow();
        var original=c.data.path("majorNames").deepCopy();
        var body=(com.fasterxml.jackson.databind.node.ObjectNode)mapper.readTree(mvc.perform(get("/api/admin/careers/"+c.id).with(localLogin())).andReturn().getResponse().getContentAsString());
        var names=mapper.createArrayNode();for(var g:body.path("groups"))names.add(g.path("name").asText());body.set("groups",names);
        body.remove(List.of("majorIds","programIds","programLinkMode"));body.put("description","Thông tin nghề đã cập nhật, ghép chương trình theo tag.");
        mvc.perform(post("/api/admin/careers").with(localLogin()).with(csrf()).contentType("application/json").content(body.toString())).andExpect(status().isOk());
        org.assertj.core.api.Assertions.assertThat(careerRecords.findById(c.id).orElseThrow().data.path("majorNames")).isEqualTo(original);
        var user=users.findByLocalUsername(subject).orElseThrow();user.role="STUDENT";users.saveAndFlush(user);
        mvc.perform(get("/api/admin/careers").with(localLogin())).andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/careers").with(localLogin()).with(csrf()).contentType("application/json").content(body.toString())).andExpect(status().isForbidden());
    }
    @BeforeEach void admin() {
        // Each transactional fixture starts with a fresh tag-edit version; rollback restores dataset versions.
        jdbc.update("delete from tag_assignment_versions");
        var u=new UserEntity();u.id=UUID.randomUUID();u.localUsername="test_"+UUID.randomUUID().toString().substring(0,16);u.passwordHash=encoder.encode("Fixture-password");u.email="test@example.invalid";
        u.displayName="Test admin";u.role="ADMIN";u.active=true;u.createdAt=Instant.now();users.saveAndFlush(u);subject=u.localUsername;
    }
    @Test void workbookDatasetHas35Schools1275RowsAnd45ActiveOrientationTags() throws Exception {
        org.assertj.core.api.Assertions.assertThat(jdbc.queryForObject("select count(*) from catalog_tags where active",Long.class)).isEqualTo(45);
        org.assertj.core.api.Assertions.assertThat(jdbc.queryForObject("select count(*) from programs where admission_details->'workbook'->>'datasetVersion'='admissions-35-schools-v1'",Long.class)).isEqualTo(1275);
        org.assertj.core.api.Assertions.assertThat(jdbc.queryForObject("select count(*) from programs where admission_details->'workbook'->>'duplicateName'='true'",Long.class)).isEqualTo(12);
        mvc.perform(get("/api/schools")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(35));
        mvc.perform(get("/api/schools/UET/programs")).andExpect(status().isOk()).andExpect(jsonPath("$.programs.length()").value(20));
        org.assertj.core.api.Assertions.assertThat(jdbc.queryForObject("select count(*) from career_tags ct join catalog_tags t on t.id=ct.tag_id where t.origin='MIGRATED_MAJOR' and not t.active",Long.class)).isZero();
    }
    @Test void workbookKeepsMissingRawAndOver30CutoffsWithoutApplyingStandardFormula() throws Exception {
        var row=jdbc.queryForMap("select id,benchmark,admission_details from programs where admission_details->'workbook'->>'sourceRow'='720'");
        org.assertj.core.api.Assertions.assertThat(row.get("benchmark")).isNull();
        var data=mapper.readTree(row.get("admission_details").toString());
        org.assertj.core.api.Assertions.assertThat(data.path("calculationSupported").asBoolean()).isFalse();
        org.assertj.core.api.Assertions.assertThat(data.path("workbook").path("cutoffs").get(2).path("score").asDouble()).isEqualTo(34.66);
        String response=mvc.perform(post("/api/recommendations").with(csrf()).contentType("application/json").content("{\"year\":2026,\"mode\":\"POINTS\",\"scores\":{\"toan\":9,\"van\":9,\"anh\":9}}")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        JsonNode item=null;for(var value:mapper.readTree(response).path("items"))if(value.path("program").path("id").asText().equals(row.get("id").toString()))item=value;
        org.assertj.core.api.Assertions.assertThat(item).isNotNull();org.assertj.core.api.Assertions.assertThat(item.path("admissionScore").isNull()).isTrue();
        var gm=mapper.readTree(jdbc.queryForObject("select admission_details::text from programs where admission_details->'workbook'->>'sourceRow'='62'",String.class));
        org.assertj.core.api.Assertions.assertThat(gm.path("workbook").path("cutoffs").get(0).path("raw").asText()).isEqualTo("GM");
        org.assertj.core.api.Assertions.assertThat(gm.path("workbook").path("cutoffs").get(0).path("score").isNull()).isTrue();
    }
    @Test void catalogHas378CareersAndOfficialProgrammeDataWithHonestMissingValues() throws Exception {
        mvc.perform(get("/api/career-catalog").param("size","24")).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(378)).andExpect(jsonPath("$.items.length()").value(24)).andExpect(jsonPath("$.items[0].fit.score").doesNotExist());
        mvc.perform(get("/api/career-catalog").param("q","15-1252.00")).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1)).andExpect(jsonPath("$.items[0].skillSourceVersion").value("O*NET 31.0"));
        var p=entityManager.find(ProgramEntity.class,vn.edu.huongnghiep.modules.careers.CatalogSupplementService.programId("UET_CN1"));
        org.assertj.core.api.Assertions.assertThat(p.verified).isTrue();org.assertj.core.api.Assertions.assertThat(p.benchmark).isEqualByComparingTo("25.00");org.assertj.core.api.Assertions.assertThat(p.benchmarkHistory.size()).isEqualTo(6);
    }
    @Test void careerFitUsesOnlyOwnedOrCurrentGuestHollandAndOptOutHasNoFit() throws Exception {
        var version=quizzes.findByStatusOrderByQuizType("PUBLISHED").stream().filter(q->q.quizType.equals("HOLLAND")).findFirst().orElseThrow();
        var result=new QuizResultEntity();result.id=UUID.randomUUID();result.quizVersionId=version.id;result.answers=mapper.createObjectNode();result.scores=mapper.createObjectNode();result.normalizedScores=mapper.valueToTree(Map.of("R",70,"I",100,"A",10,"S",10,"E",20,"C",60));result.createdAt=Instant.now();entityManager.persist(result);entityManager.flush();
        org.springframework.session.SessionRepository sessionRepository=sessions;
        org.springframework.session.Session session=sessionRepository.createSession();session.setAttribute("quiz-result-HOLLAND",result.id.toString());sessionRepository.save(session);
        var cookie=new jakarta.servlet.http.Cookie("SESSION",java.util.Base64.getEncoder().encodeToString(session.getId().getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        mvc.perform(get("/api/career-catalog").param("q","15-1252.00").param("quizResultId",result.id.toString()).cookie(cookie)).andExpect(status().isOk()).andExpect(jsonPath("$.items[0].fit.version").value("onet31-cosine-v1")).andExpect(jsonPath("$.items[0].fit.score").isNumber());
        mvc.perform(get("/api/career-catalog").param("quizResultId",result.id.toString())).andExpect(status().isNotFound());
        mvc.perform(get("/api/career-catalog").param("q","15-1252.00").cookie(cookie)).andExpect(status().isOk()).andExpect(jsonPath("$.items[0].fit.score").doesNotExist());
    }
    @Test void realExcelImportIsIdempotentAndPreservesEnrichment() throws Exception {
        byte[] bytes;try(var s=new org.springframework.core.io.ClassPathResource("seed/careers-source.xlsx").getInputStream()){bytes=s.readAllBytes();}
        var upload=new org.springframework.mock.web.MockMultipartFile("file","careers.xlsx","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",bytes);
        mvc.perform(multipart("/api/admin/career-imports/preview").file(upload).with(csrf())).andExpect(status().isUnauthorized());
        String body=mvc.perform(multipart("/api/admin/career-imports/preview").file(upload).with(localLogin()).with(csrf())).andExpect(status().isOk()).andExpect(jsonPath("$.added").value(0)).andExpect(jsonPath("$.updated").value(0)).andExpect(jsonPath("$.unchanged").value(378)).andReturn().getResponse().getContentAsString();
        String id=mapper.readTree(body).path("id").asText();
        for(int i=0;i<2;i++)mvc.perform(post("/api/admin/career-imports/"+id+"/commit").with(localLogin()).with(csrf())).andExpect(status().isOk());
        org.assertj.core.api.Assertions.assertThat(careerRecords.findByPublishedTrue()).hasSize(378);org.assertj.core.api.Assertions.assertThat(careerRecords.findByOnetCode("15-1252.00").orElseThrow().data.path("skills").size()).isGreaterThan(0);
    }
    @Test void importConflictsAndRollbackDoNotLoseNewerChanges() throws Exception {
        byte[] bytes;try(var wb=new org.apache.poi.xssf.usermodel.XSSFWorkbook(new org.springframework.core.io.ClassPathResource("seed/careers-source.xlsx").getInputStream());var out=new java.io.ByteArrayOutputStream()) {wb.getSheetAt(0).getRow(1).getCell(4).setCellValue("Nội dung kiểm thử cập nhật");wb.write(out);bytes=out.toByteArray();}
        var upload=new org.springframework.mock.web.MockMultipartFile("file","changed.xlsx","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",bytes);
        String body=mvc.perform(multipart("/api/admin/career-imports/preview").file(upload).with(localLogin()).with(csrf())).andExpect(status().isOk()).andExpect(jsonPath("$.updated").value(1)).andReturn().getResponse().getContentAsString();String id=mapper.readTree(body).path("id").asText();
        mvc.perform(post("/api/admin/career-imports/"+id+"/commit").with(localLogin()).with(csrf())).andExpect(status().isOk());
        mvc.perform(post("/api/admin/career-imports/"+id+"/revert").with(localLogin()).with(csrf())).andExpect(status().isOk());
        org.assertj.core.api.Assertions.assertThat(careerRecords.findByOnetCode("11-1011.00").orElseThrow().data.path("description").asText()).doesNotContain("kiểm thử");
        body=mvc.perform(multipart("/api/admin/career-imports/preview").file(upload).with(localLogin()).with(csrf())).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();id=mapper.readTree(body).path("id").asText();
        var c=careerRecords.findByOnetCode("11-1011.00").orElseThrow();c.published=false;careerRecords.saveAndFlush(c);
        mvc.perform(post("/api/admin/career-imports/"+id+"/commit").with(localLogin()).with(csrf())).andExpect(status().isConflict());
    }
    @Test void standardWorkbookCanBePreviewedCommittedAndReverted() throws Exception {
        byte[] bytes;try(var s=new org.springframework.core.io.ClassPathResource("templates/catalog-v1.xlsx").getInputStream()){bytes=s.readAllBytes();}
        var upload=new org.springframework.mock.web.MockMultipartFile("file","standard.xlsx","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",bytes);
        String body=mvc.perform(multipart("/api/admin/career-imports/preview").file(upload).with(localLogin()).with(csrf())).andExpect(status().isOk()).andExpect(jsonPath("$.errors.length()").value(0)).andExpect(jsonPath("$.supplementaryCounts.programs").value(2)).andReturn().getResponse().getContentAsString();String id=mapper.readTree(body).path("id").asText();
        mvc.perform(post("/api/admin/career-imports/"+id+"/commit").with(localLogin()).with(csrf())).andExpect(status().isOk());
        mvc.perform(post("/api/admin/career-imports/"+id+"/revert").with(localLogin()).with(csrf())).andExpect(status().isOk());
        mvc.perform(get("/api/admin/career-imports/template").with(localLogin())).andExpect(status().isOk());
    }
    @Test void exportedCatalogCanBeReimportedAndStudentCannotImport() throws Exception {
        byte[] bytes=mvc.perform(get("/api/admin/career-imports/export").with(localLogin())).andExpect(status().isOk()).andReturn().getResponse().getContentAsByteArray();
        try(var workbook=new org.apache.poi.xssf.usermodel.XSSFWorkbook(new java.io.ByteArrayInputStream(bytes))){org.assertj.core.api.Assertions.assertThat(workbook.getSheet("DIEM_TU_FILE").getLastRowNum()).isEqualTo(1275);}
        var upload=new org.springframework.mock.web.MockMultipartFile("file","export.xlsx","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",bytes);
        mvc.perform(multipart("/api/admin/career-imports/preview").file(upload).with(localLogin()).with(csrf())).andExpect(status().isOk()).andExpect(jsonPath("$.errors.length()").value(0));
        var user=users.findByLocalUsername(subject).orElseThrow();user.role="STUDENT";users.saveAndFlush(user);
        mvc.perform(multipart("/api/admin/career-imports/preview").file(upload).with(localLogin()).with(csrf())).andExpect(status().isForbidden());
    }
    @Test void benchmarkHistoryPersistsWithPermissionsConflictChecksAndWeightedRecommendation() throws Exception {
        var p=new ProgramEntity();p.id=UUID.randomUUID();p.school="Trường kiểm thử lịch sử";p.shortName="TEST";p.major="Ngành kiểm thử";p.majorCode="T01";p.admissionYear=2026;
        p.subjectGroups=mapper.valueToTree(List.of(Map.of("code","A00","subjects",List.of("toan","ly","hoa"))));p.hollandProfile=mapper.valueToTree(Map.of("I",100));p.published=true;
        entityManager.persist(p);entityManager.flush();
        var points=new ArrayList<Map<String,Object>>();
        for(int i=1;i<=3;i++) points.add(Map.of("group","A00","year",2026-i,"score",28-i,"sourceUrl","https://example.edu.vn/"+(2026-i),"verified",true,"comparable",true));
        String path="/api/admin/programs/"+p.id+"/benchmarks";
        var body=mapper.writeValueAsString(Map.of("revision",0,"points",points));
        mvc.perform(get(path)).andExpect(status().isUnauthorized());
        mvc.perform(put(path).with(localLogin()).contentType("application/json").content(body)).andExpect(status().isForbidden());
        mvc.perform(put(path).with(localLogin()).with(csrf()).contentType("application/json").content(body))
            .andExpect(status().isOk()).andExpect(jsonPath("$.revision").value(1)).andExpect(jsonPath("$.points.length()").value(3));
        mvc.perform(put(path).with(localLogin()).with(csrf()).contentType("application/json").content(body)).andExpect(status().isConflict());
        entityManager.clear();
        mvc.perform(get(path).with(localLogin())).andExpect(status().isOk()).andExpect(jsonPath("$.points[0].score").value(27));
        String recommendation=mapper.writeValueAsString(Map.of("year",2026,"mode","POINTS","scores",Map.of("toan",9,"ly",9,"hoa",9),"priority",Map.of("region","KV1","category","NONE","graduationYear",2026)));
        var response=mvc.perform(post("/api/recommendations").with(csrf()).contentType("application/json").content(recommendation)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        JsonNode item=null;for(var candidate:mapper.readTree(response).path("items")) if(candidate.path("program").path("id").asText().equals(p.id.toString())) item=candidate;
        org.assertj.core.api.Assertions.assertThat(item).isNotNull();
        org.assertj.core.api.Assertions.assertThat(item.path("admissionScore").decimalValue()).isEqualByComparingTo("27.30");
        org.assertj.core.api.Assertions.assertThat(item.path("estimate").path("reference").decimalValue()).isEqualByComparingTo("26.30");
        org.assertj.core.api.Assertions.assertThat(item.path("estimate").path("band").asText()).isEqualTo("ABOVE");
        var user=users.findByLocalUsername(subject).orElseThrow();user.role="STUDENT";users.saveAndFlush(user);
        mvc.perform(get(path).with(localLogin())).andExpect(status().isForbidden());
        mvc.perform(put(path).with(localLogin()).with(csrf()).contentType("application/json").content(body)).andExpect(status().isForbidden());
    }
    @Test void schoolCalculationValidatesRequestsAndStoresRuleSnapshotForSignedInUser() throws Exception {
        mvc.perform(get("/api/admissions/policies")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(7));
        var input=mapper.writeValueAsString(Map.of("policyId","FTU_HSA_30","year",2026,"priority",Map.of("region","KV3","category","NONE","graduationYear",2026),"examScore",125,"examYear",2026,"hsaSection","ENGLISH","academicRequirement",true,"conductRequirement",true));
        mvc.perform(post("/api/admissions/calculate").contentType("application/json").content(input)).andExpect(status().isForbidden());
        mvc.perform(post("/api/admissions/calculate").with(localLogin()).with(csrf()).contentType("application/json").content(input))
            .andExpect(status().isOk()).andExpect(jsonPath("$.totalScore").value(28.5)).andExpect(jsonPath("$.policy.version").value("FTU-2026-v1"));
        var user=users.findByLocalUsername(subject).orElseThrow();
        Long count=entityManager.createQuery("select count(r) from RecommendationRunEntity r where r.userId=:user and r.algorithmVersion='school-score-2026-v1'",Long.class).setParameter("user",user.id).getSingleResult();
        org.assertj.core.api.Assertions.assertThat(count).isEqualTo(1);
        mvc.perform(post("/api/admissions/calculate").with(csrf()).contentType("application/json").content(input.replace("125","151"))).andExpect(status().isUnprocessableEntity());
    }
    @Test void adminCanCreateAndUpdateProgramWithOptimisticVersion() throws Exception {
        var request=mapper.createObjectNode();request.put("school","Trường thử");request.put("shortName","TEST");request.put("major","Ngành thử");request.put("majorCode","001");request.put("admissionYear",2026);
        request.set("subjectGroups",mapper.valueToTree(List.of(Map.of("code","A00","subjects",List.of("toan","ly","hoa")))));
        request.set("hollandProfile",mapper.valueToTree(Map.of("I",100)));request.put("published",true);request.put("verified",false);request.put("revision",0);
        var body=mvc.perform(post("/api/admin/programs").with(localLogin()).with(csrf()).contentType("application/json").content(request.toString()))
            .andExpect(status().isOk()).andExpect(jsonPath("$.major").value("Ngành thử")).andReturn().getResponse().getContentAsString();
        JsonNode created=mapper.readTree(body);request.put("major","Ngành đã sửa");
        mvc.perform(put("/api/admin/programs/"+created.path("id").asText()).with(localLogin()).with(csrf()).contentType("application/json").content(request.toString()))
            .andExpect(status().isOk()).andExpect(jsonPath("$.revision").value(1));
        mvc.perform(put("/api/admin/programs/"+created.path("id").asText()).with(localLogin()).with(csrf()).contentType("application/json").content(request.toString()))
            .andExpect(status().isConflict());
    }
    @Test void studentCannotManageProgramsEvenWithValidCSRF() throws Exception {
        var user=users.findByLocalUsername(subject).orElseThrow();user.role="STUDENT";users.saveAndFlush(user);
        mvc.perform(get("/api/admin/programs").with(localLogin())).andExpect(status().isForbidden());
    }
    @Test void publishedQuizCanBeReplacedWithoutEditingOldQuestions() throws Exception {
        var previous=quizzes.findByStatusOrderByQuizType("PUBLISHED").stream().filter(q->q.quizType.equals("HOLLAND")).findFirst().orElseThrow();
        var request=Map.of("type","HOLLAND","title","Phiên bản thử","questions",previous.questions);
        var body=mvc.perform(post("/api/admin/quizzes").with(localLogin()).with(csrf()).contentType("application/json").content(mapper.writeValueAsString(request)))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        var draft=mapper.readTree(body);
        mvc.perform(post("/api/admin/quizzes/"+draft.path("id").asText()+"/publish").with(localLogin()).with(csrf()).contentType("application/json").content("{\"revision\":0}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("PUBLISHED"));
    }
    @Test void bookmarksAreScopedToCurrentUser() throws Exception {
        mvc.perform(post("/api/me/bookmarks").with(localLogin()).with(csrf()).contentType("application/json")
            .content("{\"id\":\"career-test\",\"type\":\"career\",\"name\":\"Nghề thử\",\"savedAt\":100}"))
            .andExpect(status().isOk());
        mvc.perform(get("/api/me/bookmarks").with(localLogin())).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
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
    @Test void historyDetailDeleteAndRestoreArePrivateAndDeletedResultsCannotBeReused() throws Exception {
        var quiz=quizzes.findByStatusOrderByQuizType("PUBLISHED").stream().filter(q->q.quizType.equals("HOLLAND")).findFirst().orElseThrow();
        var answers=new LinkedHashMap<Integer,Integer>();
        quiz.questions.forEach(q->answers.put(q.path("id").asInt(),4));
        var session=new org.springframework.mock.web.MockHttpSession();
        var submitBody=mapper.writeValueAsString(Map.of("quizVersionId",quiz.id,"answers",answers));
        var response=mvc.perform(post("/api/quiz-results").session(session).with(localLogin()).with(csrf()).contentType("application/json").content(submitBody))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        var id=mapper.readTree(response).path("id").asText();
        var path="/api/me/quiz-results/"+id;
        mvc.perform(get(path).with(localLogin())).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(id));
        var other=new UserEntity();other.id=UUID.randomUUID();other.localUsername="other_"+UUID.randomUUID().toString().substring(0,16);other.passwordHash=encoder.encode("Other-fixture-password");other.email="other@example.invalid";other.displayName="Other student";other.role="STUDENT";other.active=true;other.createdAt=Instant.now();users.saveAndFlush(other);
        mvc.perform(get(path).with(user(other.id.toString()))).andExpect(status().isNotFound());
        mvc.perform(delete(path).with(user(other.id.toString())).with(csrf())).andExpect(status().isNotFound());
        mvc.perform(post(path+"/restore").with(user(other.id.toString())).with(csrf())).andExpect(status().isNotFound());
        mvc.perform(delete(path).with(localLogin())).andExpect(status().isForbidden());
        mvc.perform(delete(path).with(localLogin()).with(csrf())).andExpect(status().isOk());
        mvc.perform(get(path).with(localLogin())).andExpect(status().isNotFound());
        mvc.perform(get("/api/me/quiz-results").with(localLogin())).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(post("/api/recommendations").session(session).with(localLogin()).with(csrf()).contentType("application/json")
            .content(mapper.writeValueAsString(Map.of("year",2026,"mode","INTEREST","scores",Map.of(),"quizResultId",id))))
            .andExpect(status().isNotFound());
        mvc.perform(post("/api/quiz-results").session(session).with(localLogin()).with(csrf()).contentType("application/json").content(submitBody))
            .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(org.hamcrest.Matchers.not(id)));
        mvc.perform(post(path+"/restore").with(localLogin()).with(csrf())).andExpect(status().isOk());
        mvc.perform(get(path).with(localLogin())).andExpect(status().isOk());
    }
    @Test void savedProfileReturnsSubjectScoresAndAdmissionYear() throws Exception {
        var body="{\"schoolName\":\"Trường thử\",\"grade\":\"12\",\"targetYear\":2027,\"scores\":{\"toan\":8.25,\"ly\":7.5},\"revision\":0}";
        mvc.perform(put("/api/me/profile").with(localLogin()).with(csrf()).contentType("application/json").content(body)).andExpect(status().isOk());
        mvc.perform(get("/api/me/profile").with(localLogin()))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.targetYear").value(2027)).andExpect(jsonPath("$.data.scores.toan").value(8.25)).andExpect(jsonPath("$.data.scores.ly").value(7.5));
    }
    @Test void quizDeletionPreservesBothTypesAndHistoricalResults() throws Exception {
        for (var type:List.of("HOLLAND","MI")) {
            var original=quizzes.findByStatusOrderByQuizType("PUBLISHED").stream().filter(q->q.quizType.equals(type)).findFirst().orElseThrow();
            var originalId=original.id;
            mvc.perform(delete("/api/admin/quizzes/"+originalId).param("revision",Long.toString(original.revision)).with(localLogin()).with(csrf()))
                .andExpect(status().isUnprocessableEntity());
            var answers=new LinkedHashMap<Integer,Integer>();original.questions.forEach(q->answers.put(q.path("id").asInt(),3));
            var resultBody=mvc.perform(post("/api/quiz-results").with(localLogin()).with(csrf()).contentType("application/json").content(mapper.writeValueAsString(Map.of("quizVersionId",originalId,"answers",answers))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
            var draftBody=mvc.perform(post("/api/admin/quizzes").with(localLogin()).with(csrf()).contentType("application/json").content(mapper.writeValueAsString(Map.of("type",type,"title","Bản thay thế","questions",original.questions))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
            var draft=mapper.readTree(draftBody);var draftId=draft.path("id").asText();
            mvc.perform(delete("/api/admin/quizzes/"+originalId).param("revision",Long.toString(original.revision)).with(localLogin()).with(csrf()))
                .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("đang được sử dụng")));
            mvc.perform(post("/api/admin/quizzes/"+draftId+"/publish").with(localLogin()).with(csrf()).contentType("application/json").content("{\"revision\":0}"))
                .andExpect(status().isOk());
            entityManager.clear();
            var archived=quizzes.findById(originalId).orElseThrow();var revision=archived.revision;
            var deletePath="/api/admin/quizzes/"+originalId;
            mvc.perform(delete(deletePath).param("revision",Long.toString(revision-1)).with(localLogin()).with(csrf())).andExpect(status().isConflict());
            mvc.perform(delete(deletePath).param("revision",Long.toString(revision)).with(localLogin())).andExpect(status().isForbidden());
            mvc.perform(delete(deletePath).param("revision",Long.toString(revision)).with(localLogin()).with(csrf())).andExpect(status().isOk());
            entityManager.clear();
            var adminList=mvc.perform(get("/api/admin/quizzes").with(localLogin())).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
            org.assertj.core.api.Assertions.assertThat(mapper.readTree(adminList).findValuesAsText("id")).doesNotContain(originalId.toString());
            var resultId=mapper.readTree(resultBody).path("id").asText();
            mvc.perform(get("/api/me/quiz-results/"+resultId).with(localLogin()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.quizVersionId").value(originalId.toString()));
            mvc.perform(post("/api/admin/quizzes/"+originalId+"/publish").with(localLogin()).with(csrf()).contentType("application/json").content("{\"revision\":0}"))
                .andExpect(status().isNotFound());
            mvc.perform(post(deletePath+"/restore").with(localLogin()).with(csrf())).andExpect(status().isOk());
        }
        mvc.perform(get("/api/quizzes")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2));
    }
    @Test void studentCannotDeleteOrRestoreQuestionSets() throws Exception {
        var q=quizzes.findByStatusOrderByQuizType("PUBLISHED").getFirst();
        var user=users.findByLocalUsername(subject).orElseThrow();user.role="STUDENT";users.saveAndFlush(user);
        mvc.perform(delete("/api/admin/quizzes/"+q.id).param("revision",Long.toString(q.revision)).with(localLogin()).with(csrf())).andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/quizzes/"+q.id+"/restore").with(localLogin()).with(csrf())).andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/quizzes/"+q.id+"/publish").with(localLogin()).with(csrf()).contentType("application/json").content("{\"revision\":0}")).andExpect(status().isForbidden());
    }
    @Test void adminCanSelectAnArchivedQuestionSetAgainWithoutCreatingAnotherVersion() throws Exception {
        var original=quizzes.findByStatusOrderByQuizType("PUBLISHED").stream().filter(q->q.quizType.equals("HOLLAND")).findFirst().orElseThrow();
        var originalId=original.id;
        var draftBody=mvc.perform(post("/api/admin/quizzes").with(localLogin()).with(csrf()).contentType("application/json").content(mapper.writeValueAsString(Map.of("type","HOLLAND","title","Bộ thay thế","questions",original.questions))))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        var draft=mapper.readTree(draftBody);var draftId=draft.path("id").asText();var count=quizzes.count();
        mvc.perform(post("/api/admin/quizzes/"+draftId+"/publish").with(localLogin()).with(csrf()).contentType("application/json").content("{\"revision\":0}"))
            .andExpect(status().isOk());
        entityManager.clear();
        var archived=quizzes.findById(originalId).orElseThrow();
        mvc.perform(post("/api/admin/quizzes/"+originalId+"/publish").with(localLogin()).with(csrf()).contentType("application/json").content("{\"revision\":0}"))
            .andExpect(status().isConflict());
        mvc.perform(post("/api/admin/quizzes/"+originalId+"/publish").with(localLogin()).with(csrf()).contentType("application/json").content("{\"revision\":"+archived.revision+"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(originalId.toString())).andExpect(jsonPath("$.status").value("PUBLISHED"));
        entityManager.clear();
        org.assertj.core.api.Assertions.assertThat(quizzes.count()).isEqualTo(count);
        org.assertj.core.api.Assertions.assertThat(quizzes.findById(UUID.fromString(draftId)).orElseThrow().status).isEqualTo("ARCHIVED");
        mvc.perform(get("/api/quizzes")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2));
    }
}
