CREATE TABLE schools (
 id UUID PRIMARY KEY,
 code VARCHAR(100) NOT NULL UNIQUE,
 name VARCHAR(255) NOT NULL,
 website VARCHAR(2000),
 active BOOLEAN NOT NULL DEFAULT TRUE,
 revision BIGINT NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO schools(id,code,name)
 SELECT md5('school:'||code)::uuid,code,
 (array_agg(school ORDER BY has_workbook DESC,admission_year DESC,id))[1]
 FROM (SELECT id,school,admission_year,admission_details ? 'workbook' AS has_workbook,
 upper(coalesce(nullif(admission_details->>'schoolCode',''),short_name)) AS code FROM programs) p GROUP BY code;
ALTER TABLE programs ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;
UPDATE programs SET school_id=s.id FROM schools s WHERE s.code=upper(coalesce(nullif(programs.admission_details->>'schoolCode',''),programs.short_name));
CREATE INDEX programs_school_idx ON programs(school_id);
