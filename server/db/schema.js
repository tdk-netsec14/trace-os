// SQLite schema initialization for the local Trace OS database.
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  file_path TEXT,
  project TEXT,
  content TEXT,
  metadata TEXT,
  embedding TEXT,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rationale TEXT,
  files_affected TEXT,
  tags TEXT,
  embedding TEXT,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_name TEXT NOT NULL,
  started_at INTEGER,
  ended_at INTEGER,
  summary TEXT,
  files_touched TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS context_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_path TEXT UNIQUE,
  context TEXT,
  generated_at INTEGER,
  expires_at INTEGER
);
`;

function initializeSchema(db) {
  db.exec(SCHEMA_SQL);
}

module.exports = {
  initializeSchema
};
