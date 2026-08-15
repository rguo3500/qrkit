-- QRKit D1 team collaboration migration.
-- Additive only: preserves existing dynamic_links and scan_events rows.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  open_id TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  login_method TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_signed_in TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  user_id TEXT,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (team_id, email)
);

CREATE TABLE IF NOT EXISTS dynamic_link_shares (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  dynamic_link_id TEXT NOT NULL,
  granted_by_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (dynamic_link_id) REFERENCES dynamic_links(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (team_id, dynamic_link_id)
);

CREATE INDEX IF NOT EXISTS users_open_id_idx ON users(open_id);
CREATE INDEX IF NOT EXISTS teams_owner_idx ON teams(owner_user_id);
CREATE INDEX IF NOT EXISTS team_members_team_idx ON team_members(team_id);
CREATE INDEX IF NOT EXISTS team_members_user_idx ON team_members(user_id);
CREATE INDEX IF NOT EXISTS dynamic_link_shares_team_idx ON dynamic_link_shares(team_id);
CREATE INDEX IF NOT EXISTS dynamic_link_shares_link_idx ON dynamic_link_shares(dynamic_link_id);
CREATE INDEX IF NOT EXISTS dynamic_links_user_idx ON dynamic_links(user_id);
CREATE INDEX IF NOT EXISTS scan_events_created_idx ON scan_events(created_at);
CREATE INDEX IF NOT EXISTS scan_events_link_created_idx ON scan_events(dynamic_link_id, created_at);

PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO users (id, open_id, name, email, login_method, role, created_at, updated_at, last_signed_in)
SELECT 'legacy-' || user_id, user_id, NULL, NULL, NULL, 'user', MIN(created_at), MAX(updated_at), MAX(updated_at)
FROM dynamic_links
GROUP BY user_id;
