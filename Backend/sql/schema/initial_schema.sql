BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> 0001

CREATE TABLE reports (
    id SERIAL NOT NULL, 
    slug VARCHAR(120) NOT NULL, 
    source_url VARCHAR(2048) NOT NULL, 
    site_name VARCHAR(255) NOT NULL, 
    page_count INTEGER NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_reports PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_reports_slug ON reports (slug);

CREATE INDEX ix_reports_created_at ON reports (created_at);

CREATE TABLE report_pages (
    id SERIAL NOT NULL, 
    report_id INTEGER NOT NULL, 
    position INTEGER NOT NULL, 
    url VARCHAR(2048) NOT NULL, 
    title VARCHAR(500) NOT NULL, 
    meta_description TEXT, 
    headings JSONB NOT NULL, 
    summary TEXT NOT NULL, 
    word_count INTEGER NOT NULL, 
    link_count INTEGER NOT NULL, 
    image_count INTEGER NOT NULL, 
    fetched_at TIMESTAMP WITH TIME ZONE NOT NULL, 
    CONSTRAINT pk_report_pages PRIMARY KEY (id), 
    CONSTRAINT fk_report_pages_report_id_reports FOREIGN KEY(report_id) REFERENCES reports (id) ON DELETE CASCADE, 
    CONSTRAINT uq_report_pages_report_id UNIQUE (report_id, position)
);

CREATE INDEX ix_report_pages_report_id ON report_pages (report_id);

INSERT INTO alembic_version (version_num) VALUES ('0001') RETURNING alembic_version.version_num;

COMMIT;

