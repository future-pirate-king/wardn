package store

import (
	"context"
	"fmt"
)

const schemaSQL = `
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT UNIQUE NOT NULL,
    name          TEXT NOT NULL,
    password_hash TEXT,
    role          TEXT NOT NULL DEFAULT 'user',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                 TEXT UNIQUE NOT NULL,
    description          TEXT,
    sync_windows_json    JSONB DEFAULT '[]',
    allowed_clusters_json JSONB DEFAULT '[]',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_users (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       TEXT NOT NULL DEFAULT 'read',
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS clusters (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                  TEXT UNIQUE NOT NULL,
    server_url            TEXT NOT NULL,
    kubeconfig_secret_ref TEXT NOT NULL,
    namespace             TEXT,
    status                TEXT NOT NULL DEFAULT 'unknown',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS repo_creds (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    type       TEXT NOT NULL,
    secret_ref TEXT NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS secret_stores (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    type        TEXT NOT NULL,
    backend     TEXT NOT NULL,
    config_json JSONB NOT NULL DEFAULT '{}',
    secret_ref  TEXT,
    project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
    status      TEXT NOT NULL DEFAULT 'unknown',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sync_history (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_name         TEXT NOT NULL,
    app_namespace    TEXT NOT NULL,
    project_id       UUID REFERENCES projects(id) ON DELETE SET NULL,
    revision         TEXT NOT NULL,
    previous_revision TEXT,
    started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at      TIMESTAMPTZ,
    status           TEXT NOT NULL DEFAULT 'pending',
    triggered_by     TEXT NOT NULL,
    message          TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    action        TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_name TEXT NOT NULL,
    details_json  JSONB NOT NULL DEFAULT '{}',
    timestamp     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_users_user ON project_users(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_history_app ON sync_history(app_name, app_namespace);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC);
`

func (s *Store) Migrate(ctx context.Context) error {
	_, err := s.Pool.Exec(ctx, schemaSQL)
	if err != nil {
		return fmt.Errorf("run migrations: %w", err)
	}
	return nil
}
