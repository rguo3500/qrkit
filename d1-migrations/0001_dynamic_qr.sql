CREATE TABLE IF NOT EXISTS dynamic_links (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  qr_code_id TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  destination TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scan_events (
  id TEXT PRIMARY KEY,
  dynamic_link_id TEXT NOT NULL,
  country TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (dynamic_link_id) REFERENCES dynamic_links(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS dynamic_links_slug_idx ON dynamic_links(slug);
CREATE INDEX IF NOT EXISTS scan_events_link_idx ON scan_events(dynamic_link_id);
