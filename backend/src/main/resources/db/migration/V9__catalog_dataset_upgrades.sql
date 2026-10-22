CREATE TABLE catalog_dataset_upgrades (
 dataset_key VARCHAR(100) PRIMARY KEY,
 checksum VARCHAR(64) NOT NULL,
 report JSONB NOT NULL,
 applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE retired_tag_assignments (
 entity_type VARCHAR(10) NOT NULL, entity_id VARCHAR(100) NOT NULL,
 tag_id UUID NOT NULL REFERENCES catalog_tags(id), archived_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(entity_type,entity_id,tag_id)
);
