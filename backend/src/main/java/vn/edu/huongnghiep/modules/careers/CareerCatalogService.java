package vn.edu.huongnghiep.modules.careers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.servlet.http.HttpSession;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.huongnghiep.infrastructure.persistence.*;
import vn.edu.huongnghiep.modules.auth.CurrentActor;
import vn.edu.huongnghiep.shared.ApiException;

@Service
public class CareerCatalogService {
    private final CareerRepository careers;private final QuizResultRepository results;private final QuizVersionRepository versions;
    private final CurrentActor actor;private final ObjectMapper mapper;private final JdbcTemplate jdbc;
    private final TagProgramMatcher tagMatcher;
    private final SalaryReferenceService salaries;
    private final CareerFitCalculator fit=new CareerFitCalculator();
    public CareerCatalogService(CareerRepository careers,QuizResultRepository results,QuizVersionRepository versions,CurrentActor actor,ObjectMapper mapper,JdbcTemplate jdbc,TagProgramMatcher tagMatcher,SalaryReferenceService salaries) {
        this.careers=careers;this.results=results;this.versions=versions;this.actor=actor;this.mapper=mapper;this.jdbc=jdbc;this.tagMatcher=tagMatcher;this.salaries=salaries;
    }
    public record Page(List<JsonNode> items,int total,int page,int size,List<Map<String,Object>> groups) {}
    public Map<String,Double> profile(UUID id,HttpSession session) {
        if(id==null) return null;var result=results.findById(id).orElseThrow(ApiException::missing);var user=actor.optional();
        boolean owned=user!=null && user.id.equals(result.userId);
        boolean guest=result.userId==null && result.id.toString().equals(session.getAttribute("quiz-result-HOLLAND"));
        if(result.deletedAt!=null || (!owned&&!guest)) throw ApiException.missing();
        if(!versions.findById(result.quizVersionId).orElseThrow(ApiException::missing).quizType.equals("HOLLAND")) throw ApiException.invalid("Độ phù hợp nghề cần kết quả Holland.");
        return mapper.convertValue(result.normalizedScores,new TypeReference<>(){});
    }
    public ObjectNode dto(CareerEntity entity,Map<String,Double> profile) {
        ObjectNode node=entity.data.deepCopy();node.put("id",entity.id);node.put("onetCode",entity.onetCode);node.put("revision",entity.revision);node.put("published",entity.published);
        node.put("programLinkMode","TAG");
        salaries.supplement(node,entity.onetCode);
        var scored=fit.compare(profile,node.path("hollandCode").asText());
        if(profile!=null && node.path("interestProfile").size()==6) {
            Map<String,Double> occupational=mapper.convertValue(node.path("interestProfile"),new TypeReference<>(){});
            Double similarity=new vn.edu.huongnghiep.modules.recommendations.CompatibilityCalculator().compare(profile,occupational);
            scored=new CareerFitCalculator.Fit(similarity,similarity==null?"UNAVAILABLE":similarity>=75?"HIGH":similarity>=50?"MODERATE":"EXPLORE","onet31-cosine-v1","Độ tương đồng cosine giữa sáu điểm Holland của bạn và hồ sơ sở thích O*NET 31.0. Là mức tương đồng sở thích, không đo năng lực, xác suất có việc hay đỗ đại học.",List.of());
        }
        node.set("fit",mapper.valueToTree(scored));return node;
    }
    @Transactional(readOnly=true)
    public Page search(String query,String group,String stem,String skill,Integer salary,UUID quizId,int page,int size,HttpSession session) {
        if(page<0 || size<1 || size>100) throw ApiException.invalid("Phân trang không hợp lệ (1–100 mục/trang).");
        Map<String,Double> profile=profile(quizId,session);String q=searchKey(query==null?"":query);
        var items=careers.findByPublishedTrue().stream().map(c->dto(c,profile)).filter(c->
            (q.isBlank() || searchKey(c.path("nameVi").asText()+" "+c.path("nameEn").asText()+" "+c.path("description").asText()+" "+c.path("onetCode").asText()).contains(q))
            && (group==null||group.isBlank()||contains(c.path("groups"),group)) && (stem==null||stem.isBlank()||contains(c.path("stemGroups"),stem))
            && (skill==null||skill.isBlank()||contains(c.path("skills"),skill))
            && (salary==null||(!c.path("salaryMaxVnd").isNull() && c.has("salaryMaxVnd") && c.path("salaryMaxVnd").asDouble()>=salary*1000000.0)))
            .sorted((a,b)-> { if(profile!=null) { int compared=Double.compare(b.path("fit").path("score").asDouble(-1),a.path("fit").path("score").asDouble(-1));if(compared!=0)return compared; }return a.path("nameVi").asText().compareToIgnoreCase(b.path("nameVi").asText()); }).toList();
        return new Page(new ArrayList<>(items.subList(Math.min(items.size(),page*size),Math.min(items.size(),(page+1)*size))),items.size(),page,size,
            jdbc.queryForList("select g.id,g.name,count(l.career_id) as count from career_groups g join career_group_links l on l.group_id=g.id join careers c on c.id=l.career_id and c.published group by g.id,g.name order by g.name"));
    }
    public static boolean contains(JsonNode array,String value) {for(var item:array) if(item.asText().equals(value)||item.path("id").asText().equals(value)||item.path("name").asText().equals(value)) return true;return false;}
    public static String searchKey(String value) { return java.text.Normalizer.normalize(value,java.text.Normalizer.Form.NFD).replaceAll("\\p{M}","").toLowerCase(Locale.ROOT).replace('đ','d'); }
    @Transactional(readOnly=true)
    public Map<UUID,Double> programCompatibility(Map<String,Double> profile) {
        if(profile==null)return Map.of();Map<String,Double> scores=new HashMap<>();
        for(var c:careers.findByPublishedTrue()){var dto=dto(c,profile);if(dto.path("fit").hasNonNull("score"))scores.put(c.id,dto.path("fit").path("score").asDouble());}
        Map<UUID,List<Double>> grouped=new HashMap<>();
        for(var row:tagMatcher.publicPairs()) {Double score=scores.get(row.get("career_id").toString());if(score!=null)grouped.computeIfAbsent((UUID)row.get("id"),k->new ArrayList<>()).add(score);}
        Map<UUID,Double> result=new HashMap<>();grouped.forEach((id,values)->result.put(id,Math.round(values.stream().sorted(Comparator.reverseOrder()).limit(3).mapToDouble(Double::doubleValue).average().orElse(0)*10)/10.0));return result;
    }
    @Transactional(readOnly=true)
    public Object detail(String id,UUID quizId,HttpSession session) {
        var c=careers.findById(id).orElseThrow(ApiException::missing);if(!c.published) throw ApiException.missing();var node=dto(c,profile(quizId,session));
        node.set("programs",mapper.valueToTree(tagMatcher.publicPrograms(id)));
        node.set("tags",mapper.valueToTree(jdbc.queryForList("select t.code,t.name from career_tags ct join catalog_tags t on t.id=ct.tag_id and t.active where ct.career_id=? order by t.name",id)));return node;
    }
}
