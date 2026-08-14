-- QRKit Dynamic QR schema. This migration intentionally contains no seed or test records.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qr_codes (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  destination TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dynamic_links (
  id TEXT PRIMARY KEY NOT NULL,
  qr_code_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY NOT NULL,
  qr_code_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  country TEXT,
  device TEXT,
  browser TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dynamic_links_active ON dynamic_links(active);
CREATE INDEX IF NOT EXISTS idx_dynamic_links_qr_code_id ON dynamic_links(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_scans_qr_code_id_created_at ON scans(qr_code_id, created_at);
