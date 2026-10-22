package vn.edu.huongnghiep.modules.careers;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.huongnghiep.infrastructure.persistence.*;

@Component @Order(20) @ConditionalOnProperty(name="app.seed-enabled",havingValue="true")
public class CareerCatalogBootstrap implements ApplicationRunner {
    private final CareerImportService imports;private final CareerImportJobRepository jobs;private final CareerRepository careers;private final ObjectMapper mapper;
    public CareerCatalogBootstrap(CareerImportService imports,CareerImportJobRepository jobs,CareerRepository careers,ObjectMapper mapper) {this.imports=imports;this.jobs=jobs;this.careers=careers;this.mapper=mapper;}
    @Override @Transactional
    public void run(ApplicationArguments args) throws Exception {
        byte[] bytes;try(var stream=new ClassPathResource("seed/careers-source.xlsx").getInputStream()){bytes=stream.readAllBytes();}
        if(jobs.existsByChecksum(CareerImportService.hash(bytes)))return;
        var preview=imports.prepare(bytes,"Danh mục nghề người dùng cung cấp 2026.xlsx",null,null);
        if(!preview.errors().isEmpty())throw new IllegalStateException("Career seed has invalid data: "+preview.errors());
        imports.apply(preview.id(),null);
        JsonNode enrichment;try(var stream=new ClassPathResource("seed/career-enrichment.json").getInputStream()){enrichment=mapper.readTree(stream);}
        for(var c:careers.findByPublishedTrue()) {
            if(enrichment.has(c.onetCode)) {ObjectNode data=c.data.deepCopy();var fields=enrichment.path(c.onetCode).fields();while(fields.hasNext()){var f=fields.next();data.set(f.getKey(),f.getValue());}c.data=data;careers.save(c);}
        }
    }
}
