ALTER TABLE programs ADD COLUMN benchmark_history JSONB NOT NULL DEFAULT '[]'::jsonb;
