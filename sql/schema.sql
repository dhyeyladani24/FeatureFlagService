-- Feature Flag Service — PostgreSQL schema
-- Apply: psql "$DATABASE_URL" -f sql/schema.sql
--     or: psql -h localhost -U <user> -d feature_flags -f sql/schema.sql

CREATE TABLE IF NOT EXISTS feature_flags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  environment TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  rollout_percentage INTEGER NOT NULL DEFAULT 0
    CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_users JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_countries JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (name, environment)
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_environment
  ON feature_flags (environment);

CREATE INDEX IF NOT EXISTS idx_feature_flags_name_environment
  ON feature_flags (name, environment);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  feature_name TEXT NOT NULL,
  environment TEXT NOT NULL,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_feature_env_time
  ON audit_logs (feature_name, environment, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at
  ON audit_logs (changed_at DESC);
