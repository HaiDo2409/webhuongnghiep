package vn.edu.huongnghiep;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Testcontainers(disabledWithoutDocker=true)
class PostgresIntegrationTest {
    @Container static final PostgreSQLContainer<?> postgres=new PostgreSQLContainer<>("postgres:17");
    @DynamicPropertySource static void database(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url",postgres::getJdbcUrl);r.add("spring.datasource.username",postgres::getUsername);r.add("spring.datasource.password",postgres::getPassword);
        r.add("app.seed-enabled",()->"true");
    }
    @Autowired JdbcTemplate jdbc;
    @Test void migrationsAndDevelopmentSeedAreCompatibleWithPostgres() {
        assertThat(jdbc.queryForObject("select count(*) from quiz_versions where status='PUBLISHED'",Integer.class)).isEqualTo(2);
        assertThat(jdbc.queryForObject("select count(*) from programs where verified=false",Integer.class)).isEqualTo(14);
        assertThat(jdbc.queryForObject("select count(*) from spring_session",Integer.class)).isZero();
    }
}
