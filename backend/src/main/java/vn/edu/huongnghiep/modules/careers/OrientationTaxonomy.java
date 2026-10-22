package vn.edu.huongnghiep.modules.careers;
import com.fasterxml.jackson.databind.*;
import java.util.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
@Component
public class OrientationTaxonomy {
 private final JsonNode rules;
 public OrientationTaxonomy(ObjectMapper mapper)throws java.io.IOException {try(var in=new ClassPathResource("seed/orientation-tags-v1.json").getInputStream()){rules=mapper.readTree(in);}}
 public JsonNode rules(){return rules;}
 public List<String> classify(String text){String normalized=CareerCatalogService.searchKey(text);List<String> result=new ArrayList<>();for(var rule:rules){for(var keyword:rule.path("keywords"))if(normalized.contains(keyword.asText())){result.add(rule.path("code").asText());break;}}return result.stream().limit(6).toList();}
}
