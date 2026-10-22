ALTER TABLE careers ADD COLUMN onet_code VARCHAR(10) UNIQUE;
ALTER TABLE careers ADD COLUMN published BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE careers ADD COLUMN revision BIGINT NOT NULL DEFAULT 0;
CREATE TABLE career_groups (id VARCHAR(64) PRIMARY KEY, name VARCHAR(255) NOT NULL UNIQUE);
CREATE TABLE majors (id UUID PRIMARY KEY, name VARCHAR(255) NOT NULL, normalized_name VARCHAR(255) NOT NULL UNIQUE, official_code VARCHAR(30), verified BOOLEAN NOT NULL DEFAULT FALSE);
ALTER TABLE majors ADD COLUMN external_key VARCHAR(100) UNIQUE;
ALTER TABLE majors ADD COLUMN source_url TEXT;
ALTER TABLE majors ADD COLUMN data_year INTEGER;
ALTER TABLE programs ADD COLUMN admission_details JSONB NOT NULL DEFAULT '{}';
CREATE TABLE career_group_links (career_id VARCHAR(100) REFERENCES careers(id), group_id VARCHAR(64) REFERENCES career_groups(id), PRIMARY KEY(career_id,group_id));
CREATE TABLE career_major_links (career_id VARCHAR(100) REFERENCES careers(id), major_id UUID REFERENCES majors(id), PRIMARY KEY(career_id,major_id));
ALTER TABLE programs ADD COLUMN major_id UUID REFERENCES majors(id);
CREATE TABLE career_import_jobs (
    id UUID PRIMARY KEY, actor_id UUID REFERENCES app_users(id), filename VARCHAR(255) NOT NULL,
    checksum VARCHAR(64) NOT NULL, status VARCHAR(20) NOT NULL CHECK(status IN ('PREVIEW','COMMITTED','REVERTED')),
    rows JSONB NOT NULL, changes JSONB NOT NULL DEFAULT '[]', created_at TIMESTAMPTZ NOT NULL, committed_at TIMESTAMPTZ
);
ALTER TABLE career_import_jobs ADD COLUMN supplements JSONB NOT NULL DEFAULT '{}';
CREATE INDEX career_import_date ON career_import_jobs(created_at DESC);
