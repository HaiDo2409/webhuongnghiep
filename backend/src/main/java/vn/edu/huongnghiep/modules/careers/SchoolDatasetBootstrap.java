package vn.edu.huongnghiep.modules.careers;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.huongnghiep.infrastructure.persistence.*;

@Component @Order(50) @ConditionalOnProperty(name="app.seed-enabled",havingValue="true")
public class SchoolDatasetBootstrap implements ApplicationRunner {
 private final ObjectMapper mapper;private final JdbcTemplate jdbc;private final ProgramRepository programs;private final CareerRepository careers;private final OrientationTaxonomy taxonomy;
 private final vn.edu.huongnghiep.modules.admissions.SchoolService schools;
 public SchoolDatasetBootstrap(ObjectMapper mapper,JdbcTemplate jdbc,ProgramRepository programs,CareerRepository careers,OrientationTaxonomy taxonomy,vn.edu.huongnghiep.modules.admissions.SchoolService schools){this.mapper=mapper;this.jdbc=jdbc;this.programs=programs;this.careers=careers;this.taxonomy=taxonomy;this.schools=schools;}
 private JsonNode resource(String path)throws Exception{try(var in=new ClassPathResource(path).getInputStream()){return mapper.readTree(in);}}
 private UUID uuid(String key){return UUID.nameUUIDFromBytes(key.getBytes(StandardCharsets.UTF_8));}
 private String key(String text){return CareerCatalogService.searchKey(text).replaceAll("[^a-z0-9]","");}
 @Override @Transactional public void run(ApplicationArguments args)throws Exception{
  jdbc.execute("select pg_advisory_xact_lock(74310501)");
  JsonNode dataset=resource("seed/admissions-35-schools-v1.json");String version=dataset.path("version").asText();
  if(!jdbc.queryForList("select dataset_key from catalog_dataset_upgrades where dataset_key=?",version).isEmpty())return;
  var before=programs.findAll();Map<String,List<ProgramEntity>> old=new HashMap<>();
  for(var p:before)old.computeIfAbsent(p.shortName.toUpperCase(Locale.ROOT)+":"+key(p.major),k->new ArrayList<>()).add(p);
  Set<UUID> used=new HashSet<>();int added=0,updated=0,archived=0;Map<UUID,String> contexts=new HashMap<>();
  for(var row:dataset.path("programs")){
   String schoolCode=row.path("schoolCode").asText(),name=row.path("major").asText();
   var candidates=old.getOrDefault(schoolCode+":"+key(name),List.of()).stream().filter(p->p.admissionYear==2026&&!used.contains(p.id)).sorted(Comparator.comparing((ProgramEntity p)->!p.verified)).toList();
   ProgramEntity p=!row.path("duplicateName").asBoolean()&&!candidates.isEmpty()?candidates.getFirst():null;
   boolean fresh=p==null;if(fresh){p=new ProgramEntity();p.id=uuid(version+":"+row.path("key").asText());p.hollandProfile=mapper.createObjectNode();added++;}else updated++;
   used.add(p.id);ObjectNode details=p.admissionDetails instanceof ObjectNode object?object.deepCopy():mapper.createObjectNode();
   ObjectNode source=row.deepCopy();source.put("sourceFile",dataset.path("sourceFile").asText());source.put("sourceSheet",dataset.path("sourceSheet").asText());source.put("datasetVersion",version);source.put("sourceVerified",false);
   details.set("workbook",source);details.put("schoolCode",schoolCode);details.put("sourceType","USER_WORKBOOK");details.put("calculationSupported",row.path("calculationSupported").asBoolean());
   BigDecimal current=null;for(var cutoff:row.path("cutoffs"))if(cutoff.path("year").asInt()==2026&&cutoff.path("method").asText().equals("THPT")&&cutoff.hasNonNull("score"))current=cutoff.path("score").decimalValue();
   boolean supported=row.path("calculationSupported").asBoolean();
   boolean verified=p.verified&&supported&&p.benchmark!=null&&current!=null&&p.benchmark.compareTo(current)==0;
   p.school=row.path("school").asText();p.shortName=schoolCode;p.major=name;p.admissionYear=2026;
   var school=schools.ensure(schoolCode,p.school);p.schoolId=school.id;p.school=school.name;p.shortName=school.code;
   if(fresh)p.majorCode="FILE-"+row.path("sourceRow").asInt();
   p.benchmark=supported?current:null;p.benchmarkYear=p.benchmark==null?null:2026;p.verified=verified;p.published=true;
   ArrayNode groups=mapper.createArrayNode();if(supported)for(var g:row.path("groups")){var group=groups.addObject();group.put("code",g.asText());group.set("subjects",mapper.valueToTree(CatalogSupplementService.GROUPS.get(g.asText())));}
   p.subjectGroups=groups;
   var majorRows=jdbc.queryForList("select id from majors where normalized_name=?",UUID.class,CareerWorkbookReader.key(name));UUID majorId=majorRows.isEmpty()?uuid("major:"+CareerWorkbookReader.key(name)):majorRows.getFirst();
   jdbc.update("insert into majors(id,name,normalized_name,verified) values (?,?,?,false) on conflict(normalized_name) do nothing",majorId,name,CareerWorkbookReader.key(name));p.majorId=majorId;
   ArrayNode history=p.benchmarkHistory==null?mapper.createArrayNode():p.benchmarkHistory.deepCopy();
   if(supported)for(var cutoff:row.path("cutoffs"))if(cutoff.path("method").asText().equals("THPT")&&cutoff.path("year").asInt()<2026&&cutoff.hasNonNull("score")&&cutoff.path("score").asDouble()<=30){
    for(var group:row.path("groups")){boolean exists=false;for(var point:history)if(point.path("year").asInt()==cutoff.path("year").asInt()&&point.path("group").asText().equals(group.asText()))exists=true;
     if(!exists){var point=history.addObject();point.put("year",cutoff.path("year").asInt());point.put("group",group.asText());point.set("score",cutoff.path("score"));point.put("sourceUrl","");point.put("verified",false);point.put("comparable",false);point.put("sourceFile",dataset.path("sourceFile").asText());}
    }
   }
   p.benchmarkHistory=history;p.admissionDetails=details;programs.saveAndFlush(p);contexts.put(p.id,name+" "+row.path("group").asText());
  }
  // Retire only untouched development samples, preserving their IDs and historical references.
  JsonNode demo=resource("seed/catalog.json");
  for(var p:before)if(!used.contains(p.id)&&p.admissionYear==2026&&!p.verified&&(p.sourceUrl==null||p.sourceUrl.isBlank())&&p.admissionDetails.isEmpty()){
   boolean isDemo=false;for(var d:demo.path("programs"))if(d.path("shortName").asText().equals(p.shortName)&&d.path("major").asText().equals(p.major))isDemo=true;
   if(isDemo){p.published=false;var meta=mapper.createObjectNode();meta.put("retiredDevelopmentSample",true);meta.put("retiredByDataset",version);p.admissionDetails=meta;programs.saveAndFlush(p);archived++;}
  }
  // Consolidate industry-name tags into a compact, editable orientation vocabulary.
  Map<String,UUID> tagIds=new HashMap<>();
  jdbc.update("update catalog_tags set active=false,revision=revision+1 where origin='MIGRATED_MAJOR'");
  for(var rule:taxonomy.rules()){
   String code=rule.path("code").asText(),name=rule.path("name").asText();var found=jdbc.queryForList("select id,origin from catalog_tags where code=? or normalized_name=? order by case when code=? then 0 else 1 end",code,CareerWorkbookReader.key(name),code);
   UUID id=found.isEmpty()?uuid("orientation-tag:"+code):(UUID)found.getFirst().get("id");
   if(found.isEmpty())jdbc.update("insert into catalog_tags(id,code,name,normalized_name,active,origin) values (?,?,?,?,true,'CURATED')",id,code,name,CareerWorkbookReader.key(name));
   else if(!found.getFirst().get("origin").equals("ADMIN"))jdbc.update("update catalog_tags set code=?,name=?,normalized_name=?,active=true,origin='CURATED',revision=revision+1 where id=?",code,name,CareerWorkbookReader.key(name),id);
   tagIds.put(code,id);
  }
  jdbc.update("insert into retired_tag_assignments(entity_type,entity_id,tag_id) select 'CAREER',ct.career_id,ct.tag_id from career_tags ct join catalog_tags t on t.id=ct.tag_id where t.origin='MIGRATED_MAJOR' and not t.active on conflict do nothing");
  jdbc.update("insert into retired_tag_assignments(entity_type,entity_id,tag_id) select 'PROGRAM',pt.program_id::text,pt.tag_id from program_tags pt join catalog_tags t on t.id=pt.tag_id where t.origin='MIGRATED_MAJOR' and not t.active on conflict do nothing");
  jdbc.update("delete from career_tags ct using catalog_tags t where ct.tag_id=t.id and t.origin='MIGRATED_MAJOR' and not t.active");
  jdbc.update("delete from program_tags pt using catalog_tags t where pt.tag_id=t.id and t.origin='MIGRATED_MAJOR' and not t.active");
  for(var c:careers.findByPublishedTrue()){
   String text=c.data.path("nameVi").asText()+" "+c.data.path("majorNames")+" "+c.data.path("groups");
   for(String code:taxonomy.classify(text))jdbc.update("insert into career_tags(career_id,tag_id) values (?,?) on conflict do nothing",c.id,tagIds.get(code));
   jdbc.update("insert into tag_assignment_versions(entity_type,entity_id,revision) values ('CAREER',?,1) on conflict(entity_type,entity_id) do update set revision=tag_assignment_versions.revision+1",c.id);
  }
  for(var p:programs.findAll()){
   for(String code:taxonomy.classify(contexts.getOrDefault(p.id,p.major)))jdbc.update("insert into program_tags(program_id,tag_id) values (?,?) on conflict do nothing",p.id,tagIds.get(code));
   jdbc.update("insert into tag_assignment_versions(entity_type,entity_id,revision) values ('PROGRAM',?,1) on conflict(entity_type,entity_id) do update set revision=tag_assignment_versions.revision+1",p.id.toString());
  }
  var report=mapper.createObjectNode();report.put("sourceFile",dataset.path("sourceFile").asText());report.put("schools",dataset.path("schools").size());report.put("rows",dataset.path("programs").size());report.put("added",added);report.put("updated",updated);report.put("archivedSamples",archived);report.put("orientationTags",tagIds.size());report.put("appliedAt",Instant.now().toString());
  jdbc.update("insert into catalog_dataset_upgrades(dataset_key,checksum,report) values (?,?,?::jsonb)",version,dataset.path("sourceChecksum").asText(),report.toString());
 }
}
