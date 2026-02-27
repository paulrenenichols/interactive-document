-- Initial schema for Interactive Presentation app.
-- Run with: psql $DATABASE_URL -f apps/api/migrations/001_initial.sql
-- Or use the run-migrations script from repo root.

-- Users: auth and permission checks
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Decks: owner, visibility, optional share token
CREATE TABLE IF NOT EXISTS decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visibility TEXT NOT NULL DEFAULT 'restricted' CHECK (visibility IN ('public', 'restricted')),
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_decks_owner ON decks(owner_id);
CREATE INDEX idx_decks_share_token ON decks(share_token) WHERE share_token IS NOT NULL;

-- Viewer allow-list for restricted decks
CREATE TABLE IF NOT EXISTS deck_viewers (
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (deck_id, user_id)
);

CREATE INDEX idx_deck_viewers_deck ON deck_viewers(deck_id);

-- Data sources: uploaded CSV / named datasets (before blocks so blocks can reference)
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deck_id UUID REFERENCES decks(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_data_sources_owner ON data_sources(owner_id);
CREATE INDEX idx_data_sources_deck ON data_sources(deck_id) WHERE deck_id IS NOT NULL;

-- Slides: ordered per deck
CREATE TABLE IF NOT EXISTS slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_slides_deck ON slides(deck_id);

-- Blocks: text or chart; layout and content/config
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_id UUID NOT NULL REFERENCES slides(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'chart')),
  layout JSONB NOT NULL DEFAULT '{}',
  content TEXT,
  data_source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
  chart_type TEXT,
  column_mapping JSONB
);

CREATE INDEX idx_blocks_slide ON blocks(slide_id);

-- Data rows: one row per parsed CSV row, payload as JSONB
CREATE TABLE IF NOT EXISTS data_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL,
  row_data JSONB NOT NULL DEFAULT '{}',
  UNIQUE (data_source_id, row_index)
);

CREATE INDEX idx_data_rows_source ON data_rows(data_source_id);
