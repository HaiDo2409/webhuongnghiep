package vn.edu.huongnghiep.infrastructure;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.*;
import java.time.Instant;
import java.util.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.modules.quizzes.domain.*;

/** Explicit opt-in seed. Benchmarks and interest mappings are unverified repository examples. */
@Component
@ConditionalOnProperty(name="app.seed-enabled",havingValue="true")
public class DevelopmentSeed implements ApplicationRunner {
    private final ObjectMapper mapper;
    private final QuizVersionRepository quizzes;
    private final ProgramRepository programs;
    private final CareerRepository careers;
    private final ScoringRegistry scoring;
    public DevelopmentSeed(ObjectMapper mapper,QuizVersionRepository quizzes,ProgramRepository programs,CareerRepository careers,ScoringRegistry scoring) {
        this.mapper=mapper;this.quizzes=quizzes;this.programs=programs;this.careers=careers;this.scoring=scoring;
    }
    @Override @Transactional
    public void run(ApplicationArguments args) throws Exception {
        JsonNode data;try(var input=new ClassPathResource("seed/catalog.json").getInputStream()) {data=mapper.readTree(input);}
        if(quizzes.count()==0) for(var node:data.path("quizzes")) {
            var q=new QuizVersionEntity();q.id=UUID.randomUUID();q.quizType=node.path("type").asText();q.version=1;q.title=node.path("title").asText();
            q.questions=node.path("questions");scoring.get(q.quizType).validate(mapper.convertValue(q.questions,new TypeReference<List<QuizQuestion>>(){}));
            q.status="PUBLISHED";q.createdAt=Instant.now();quizzes.save(q);
        }
        if(programs.count()==0) for(var node:data.path("programs")) {
            var p=new ProgramEntity();p.id=UUID.randomUUID();p.school=node.path("school").asText();p.shortName=node.path("shortName").asText();
            p.major=node.path("major").asText();p.majorCode=node.path("majorCode").asText();p.admissionYear=2026;
            p.subjectGroups=node.path("subjectGroups");p.hollandProfile=node.path("hollandProfile");
            if(node.hasNonNull("benchmark")) {p.benchmark=node.path("benchmark").decimalValue();p.benchmarkYear=node.path("benchmarkYear").asInt();}
            p.published=true;p.verified=false;programs.save(p);
        }
        if(careers.count()==0) for(var node:data.path("careers")) {var c=new CareerEntity();c.id=node.path("id").asText();c.data=node;careers.save(c);}
    }
}
