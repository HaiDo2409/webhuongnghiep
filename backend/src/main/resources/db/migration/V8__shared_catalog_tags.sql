CREATE TABLE catalog_tags (
 id UUID PRIMARY KEY, code VARCHAR(60) NOT NULL UNIQUE, name VARCHAR(160) NOT NULL,
 normalized_name VARCHAR(160) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE,
 origin VARCHAR(30) NOT NULL DEFAULT 'ADMIN', revision BIGINT NOT NULL DEFAULT 0
);
CREATE TABLE career_tags (career_id VARCHAR(100) REFERENCES careers(id), tag_id UUID REFERENCES catalog_tags(id), PRIMARY KEY(career_id,tag_id));
CREATE TABLE program_tags (program_id UUID REFERENCES programs(id), tag_id UUID REFERENCES catalog_tags(id), PRIMARY KEY(program_id,tag_id));
CREATE INDEX career_tags_tag_idx ON career_tags(tag_id);
CREATE INDEX program_tags_tag_idx ON program_tags(tag_id);
CREATE TABLE tag_assignment_versions (entity_type VARCHAR(10) NOT NULL CHECK(entity_type IN ('CAREER','PROGRAM')), entity_id VARCHAR(100) NOT NULL, revision BIGINT NOT NULL DEFAULT 0, PRIMARY KEY(entity_type,entity_id));
CREATE TABLE career_program_decisions (
 career_id VARCHAR(100) REFERENCES careers(id), program_id UUID REFERENCES programs(id),
 decision VARCHAR(10) NOT NULL CHECK(decision IN ('INCLUDE','EXCLUDE')),
 PRIMARY KEY(career_id,program_id)
);
CREATE TABLE catalog_tag_seed_state (seed_key VARCHAR(60) PRIMARY KEY);
-- Initial tags retain the existing industry links; these are editable application tags,
-- not externally verified skill or training accreditation claims.
INSERT INTO catalog_tags(id,code,name,normalized_name,origin)
 SELECT id,'MAJOR_'||replace(id::text,'-',''),left(name,160),left(normalized_name,160),'MIGRATED_MAJOR' FROM majors;
INSERT INTO career_tags SELECT career_id,major_id FROM career_major_links;
INSERT INTO program_tags SELECT id,major_id FROM programs WHERE major_id IS NOT NULL;
INSERT INTO program_tags(program_id,tag_id)
 SELECT p.id,m.id FROM programs p JOIN majors m ON m.normalized_name=lower(regexp_replace(trim(p.major),'\s+',' ','g')) ON CONFLICT DO NOTHING;
-- Preserve explicitly selected programmes as confirmations while enabling tag suggestions.
UPDATE careers SET data=jsonb_set(data,'{programLinkMode}','"TAG"'),revision=revision+1 WHERE onet_code IS NOT NULL;
INSERT INTO catalog_tag_seed_state SELECT 'major-tags-v1' WHERE EXISTS(select 1 from majors);
