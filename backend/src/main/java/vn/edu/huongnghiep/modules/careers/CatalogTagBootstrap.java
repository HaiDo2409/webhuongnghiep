package vn.edu.huongnghiep.modules.careers;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
@Component @Order(40)
public class CatalogTagBootstrap implements ApplicationRunner {
 private final JdbcTemplate jdbc;
 public CatalogTagBootstrap(JdbcTemplate jdbc){this.jdbc=jdbc;}
 @Override @Transactional public void run(ApplicationArguments args){
  jdbc.execute("select pg_advisory_xact_lock(74310501)");
  if(!jdbc.queryForList("select seed_key from catalog_tag_seed_state where seed_key='major-tags-v1'").isEmpty())return;
  if(jdbc.queryForObject("select count(*) from majors",Long.class)==0)return;
  jdbc.update("insert into catalog_tags(id,code,name,normalized_name,origin) select id,'MAJOR_'||replace(id::text,'-',''),left(name,160),left(normalized_name,160),'MIGRATED_MAJOR' from majors on conflict do nothing");
  jdbc.update("insert into career_tags select career_id,major_id from career_major_links on conflict do nothing");
  jdbc.update("insert into program_tags select id,major_id from programs where major_id is not null on conflict do nothing");
  jdbc.update("insert into program_tags select p.id,m.id from programs p join majors m on m.normalized_name=lower(regexp_replace(trim(p.major),'\\s+',' ','g')) on conflict do nothing");
  jdbc.update("update careers set data=jsonb_set(data,'{programLinkMode}','\"TAG\"'),revision=revision+1 where onet_code is not null");
  jdbc.update("insert into catalog_tag_seed_state values ('major-tags-v1')");
 }
}
