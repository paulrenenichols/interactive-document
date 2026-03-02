-- Add order column to blocks for reordering within a slide
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_blocks_slide_order ON blocks(slide_id, "order");
