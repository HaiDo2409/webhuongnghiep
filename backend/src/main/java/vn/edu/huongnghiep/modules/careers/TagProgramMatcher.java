package vn.edu.huongnghiep.modules.careers;

import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.huongnghiep.modules.auth.CurrentActor;

@Service
public class TagProgramMatcher {
 private final JdbcTemplate jdbc;private final CatalogTagService tags;private final CurrentActor actor;
 public TagProgramMatcher(JdbcTemplate jdbc,CatalogTagService tags,CurrentActor actor){this.jdbc=jdbc;this.tags=tags;this.actor=actor;}
 private static final String BASE="""
  with shared as (
   select ct.career_id,pt.program_id,count(*) as matched_count,string_agg(t.name,' · ' order by t.name) as matched_tags
   from career_tags ct join program_tags pt on pt.tag_id=ct.tag_id join catalog_tags t on t.id=ct.tag_id and t.active group by ct.career_id,pt.program_id
  ), totals as (select ct.career_id,count(*) as total from career_tags ct join catalog_tags t on t.id=ct.tag_id and t.active group by ct.career_id)
  select c.id as career_id,p.id,p.school,p.short_name,p.major,p.admission_year,p.source_url,p.verified,p.published,
   not exists(select 1 from schools s where s.id=p.school_id and not s.active) as school_active,
   coalesce(s.matched_count,0) as matched_count,coalesce(s.matched_tags,'') as matched_tags,coalesce(n.total,0) as career_tag_count,
   case when coalesce(n.total,0)>0 then round(100.0*coalesce(s.matched_count,0)/n.total,1) else null end as tag_coverage,
   case when d.decision='EXCLUDE' then d.decision else null end as decision,
   false as previously_confirmed,'TAG' as link_mode,
   (coalesce(s.matched_count,0)>0 and d.decision is distinct from 'EXCLUDE') as included
  from careers c cross join programs p
  left join shared s on s.career_id=c.id and s.program_id=p.id
  left join totals n on n.career_id=c.id
  left join career_program_decisions d on d.career_id=c.id and d.program_id=p.id
  """;
 private static final String VISIBLE_SCHOOL=" and not exists(select 1 from schools s where (s.id=p.school_id or (p.school_id is null and s.code=upper(coalesce(p.admission_details->>'schoolCode',p.short_name)))) and not s.active) ";
 /** Resolve only active shared tags. Historical manual links never bypass tag matching. */
 @Transactional(readOnly=true) public List<Map<String,Object>> publicPairs(){return jdbc.queryForList("""
  select distinct ct.career_id,p.id
  from career_tags ct join catalog_tags t on t.id=ct.tag_id and t.active
  join program_tags pt on pt.tag_id=ct.tag_id
  join careers c on c.id=ct.career_id join programs p on p.id=pt.program_id
  where c.published and p.published
   and not exists(select 1 from career_program_decisions d where d.career_id=c.id and d.program_id=p.id and d.decision='EXCLUDE')
  """+VISIBLE_SCHOOL);}
 @Transactional(readOnly=true) public List<Map<String,Object>> publicPrograms(String id){return jdbc.queryForList("select * from ("+BASE+" where c.id=? and c.published and p.published"+VISIBLE_SCHOOL+") candidates where included order by admission_year desc,school,major",id);}
 @Transactional(readOnly=true) public Object candidates(String id){actor.admin();tags.target("CAREER",id);return Map.of("revision",tags.revision("CAREER",id),"items",jdbc.queryForList("select * from ("+BASE+" where c.id=? and (coalesce(s.matched_count,0)>0 or d.decision='EXCLUDE')) candidates order by tag_coverage desc nulls last,school,major",id));}
}
