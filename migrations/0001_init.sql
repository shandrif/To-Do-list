-- STARK.OS task tracker — D1 (SQLite) schema
CREATE TABLE IF NOT EXISTS tasks (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT    NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  description  TEXT    NOT NULL DEFAULT '',
  assignee     TEXT    NOT NULL DEFAULT 'Shuja',
  assigned_by  TEXT    NOT NULL DEFAULT 'Commander',
  priority     TEXT    NOT NULL DEFAULT 'medium'  CHECK (priority IN ('low','medium','high','critical')),
  status       TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','completed')),
  category     TEXT    NOT NULL DEFAULT 'general',
  due_at       TEXT,                         -- ISO-8601 UTC, e.g. 2026-10-22T09:00:00.000Z
  created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee   ON tasks (assignee COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks (created_at DESC);
