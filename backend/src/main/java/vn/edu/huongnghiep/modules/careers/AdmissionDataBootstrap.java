package vn.edu.huongnghiep.modules.careers;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import java.time.Instant;
import java.util.*;
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.huongnghiep.infrastructure.persistence.*;

@Component @Order(30) @ConditionalOnProperty(name="app.seed-enabled",havingValue="true")
public class AdmissionDataBootstrap implements ApplicationRunner {
    private final CatalogSupplementService supplements;private final CareerImportJobRepository jobs;private final ObjectMapper mapper;
    public AdmissionDataBootstrap(CatalogSupplementService supplements,CareerImportJobRepository jobs,ObjectMapper mapper){this.supplements=supplements;this.jobs=jobs;this.mapper=mapper;}
    @Override @Transactional
    public void run(ApplicationArguments args)throws Exception {
        byte[] bytes;try(var stream=new ClassPathResource("seed/admissions-online-2026.json").getInputStream()){bytes=stream.readAllBytes();}
        String checksum=CareerImportService.hash(bytes);if(jobs.existsByChecksum(checksum))return;
        var node=mapper.readTree(bytes);var data=new CatalogSupplementReader.Data(mapper.convertValue(node.path("majors"),new com.fasterxml.jackson.core.type.TypeReference<>(){}),List.of(),mapper.convertValue(node.path("programs"),new com.fasterxml.jackson.core.type.TypeReference<>(){}),mapper.convertValue(node.path("benchmarks"),new com.fasterxml.jackson.core.type.TypeReference<>(){}));
        List<CareerWorkbookReader.Issue> errors=new ArrayList<>();ObjectNode plan=(ObjectNode)supplements.plan(data,Set.of(),errors);
        if(!errors.isEmpty())throw new IllegalStateException("Admission source validation failed: "+errors);
        plan.set("applied",supplements.apply(plan));var job=new CareerImportJobEntity();job.id=UUID.randomUUID();job.filename="Điểm chuẩn chính thức UET 2023–2026";job.checksum=checksum;job.status="COMMITTED";job.rows=mapper.createArrayNode();job.changes=mapper.createArrayNode();job.supplements=plan;job.createdAt=Instant.now();job.committedAt=Instant.now();jobs.save(job);
    }
}
