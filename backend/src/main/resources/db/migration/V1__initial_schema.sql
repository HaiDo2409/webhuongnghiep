CREATE TABLE app_users (
    id UUID PRIMARY KEY,
    google_subject VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(320) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'ADMIN')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quiz_versions (
    id UUID PRIMARY KEY,
    quiz_type VARCHAR(20) NOT NULL CHECK (quiz_type IN ('HOLLAND', 'MI')),
    version INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    questions JSONB NOT NULL,
    revision BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(quiz_type, version)
);
CREATE UNIQUE INDEX one_published_quiz ON quiz_versions(quiz_type) WHERE status = 'PUBLISHED';

CREATE TABLE programs (
    id UUID PRIMARY KEY,
    school VARCHAR(255) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    major VARCHAR(255) NOT NULL,
    major_code VARCHAR(30) NOT NULL,
    admission_year INTEGER NOT NULL CHECK (admission_year BETWEEN 2000 AND 2100),
    subject_groups JSONB NOT NULL,
    holland_profile JSONB NOT NULL,
    benchmark NUMERIC(6,2),
    benchmark_year INTEGER,
    source_url TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    revision BIGINT NOT NULL DEFAULT 0,
    CHECK ((benchmark IS NULL AND benchmark_year IS NULL) OR (benchmark BETWEEN 0 AND 30 AND benchmark_year IS NOT NULL))
);

CREATE TABLE careers (
    id VARCHAR(100) PRIMARY KEY,
    data JSONB NOT NULL
);
CREATE TABLE quiz_results (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES app_users(id),
    quiz_version_id UUID NOT NULL REFERENCES quiz_versions(id),
    answers JSONB NOT NULL,
    scores JSONB NOT NULL,
    normalized_scores JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX result_owner_date ON quiz_results(user_id, created_at DESC);
CREATE TABLE student_profiles (
    user_id UUID PRIMARY KEY REFERENCES app_users(id),
    data JSONB NOT NULL,
    revision BIGINT NOT NULL DEFAULT 0
);
CREATE TABLE bookmarks (
    user_id UUID NOT NULL REFERENCES app_users(id),
    item_id VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    PRIMARY KEY(user_id, item_id)
);
CREATE TABLE recommendation_runs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES app_users(id),
    quiz_result_id UUID REFERENCES quiz_results(id),
    input_snapshot JSONB NOT NULL,
    result_snapshot JSONB NOT NULL,
    algorithm_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    actor_id UUID REFERENCES app_users(id),
    action VARCHAR(100) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE SPRING_SESSION (
    PRIMARY_ID CHAR(36) NOT NULL PRIMARY KEY,
    SESSION_ID CHAR(36) NOT NULL,
    CREATION_TIME BIGINT NOT NULL,
    LAST_ACCESS_TIME BIGINT NOT NULL,
    MAX_INACTIVE_INTERVAL INT NOT NULL,
    EXPIRY_TIME BIGINT NOT NULL,
    PRINCIPAL_NAME VARCHAR(100)
);
CREATE UNIQUE INDEX SPRING_SESSION_IX1 ON SPRING_SESSION(SESSION_ID);
CREATE INDEX SPRING_SESSION_IX2 ON SPRING_SESSION(EXPIRY_TIME);
CREATE INDEX SPRING_SESSION_IX3 ON SPRING_SESSION(PRINCIPAL_NAME);
CREATE TABLE SPRING_SESSION_ATTRIBUTES (
    SESSION_PRIMARY_ID CHAR(36) NOT NULL,
    ATTRIBUTE_NAME VARCHAR(200) NOT NULL,
    ATTRIBUTE_BYTES BYTEA NOT NULL,
    PRIMARY KEY (SESSION_PRIMARY_ID, ATTRIBUTE_NAME),
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_FK FOREIGN KEY (SESSION_PRIMARY_ID) REFERENCES SPRING_SESSION(PRIMARY_ID) ON DELETE CASCADE
);
