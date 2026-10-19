package vn.edu.huongnghiep;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.mockito.Mockito.*;
import vn.edu.huongnghiep.config.SecurityConfig;
import vn.edu.huongnghiep.modules.auth.*;
import vn.edu.huongnghiep.modules.admissions.*;
import vn.edu.huongnghiep.shared.ApiException;

@WebMvcTest(controllers={AuthController.class,ProgramController.class},properties={"app.frontend-origin=http://localhost:5173","app.google-client-id=","app.google-client-secret="})
@Import(SecurityConfig.class)
class ApiSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean CurrentActor actor;
    @MockitoBean GoogleUserService google;
    @MockitoBean LocalUserDetailsService localUsers;
    @MockitoBean ProgramService programs;
    @Test void publicAuthConfigWorksWithoutGoogleCredentials() throws Exception {
        mvc.perform(get("/api/auth/config")).andExpect(status().isOk()).andExpect(jsonPath("$.googleEnabled").value(false));
    }
    @Test void anonymousCannotReadAdminEndpoints() throws Exception {
        mvc.perform(get("/api/admin/programs")).andExpect(status().isUnauthorized());verifyNoInteractions(programs);
    }
    @Test void authenticatedStudentIsStillSubjectToServicePermissionChecks() throws Exception {
        when(programs.list(true)).thenThrow(new ApiException(org.springframework.http.HttpStatus.FORBIDDEN,"Không có quyền."));
        mvc.perform(get("/api/admin/programs").with(oidcLogin())).andExpect(status().isForbidden());
    }
    @Test void mutatingRequestRequiresCSRFToken() throws Exception {
        mvc.perform(post("/api/admin/programs").with(oidcLogin()).contentType("application/json").content("{}"))
            .andExpect(status().isForbidden());verifyNoInteractions(programs);
    }
    @Test void exposesCSRFFromSessionForSPA() throws Exception {
        mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty()).andExpect(jsonPath("$.headerName").value("X-CSRF-TOKEN"));
    }
}
