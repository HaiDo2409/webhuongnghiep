ALTER TABLE app_users ALTER COLUMN google_subject DROP NOT NULL;
ALTER TABLE app_users ADD COLUMN local_username VARCHAR(40);
ALTER TABLE app_users ADD COLUMN password_hash VARCHAR(255);
CREATE UNIQUE INDEX unique_local_username ON app_users(local_username) WHERE local_username IS NOT NULL;
ALTER TABLE app_users ADD CONSTRAINT valid_local_identity CHECK (
    (local_username IS NULL AND password_hash IS NULL) OR
    (local_username IS NOT NULL AND local_username ~ '^[a-z0-9][a-z0-9_.-]{2,39}$' AND password_hash IS NOT NULL)
);
ALTER TABLE app_users ADD CONSTRAINT has_login_identity CHECK (google_subject IS NOT NULL OR local_username IS NOT NULL);
