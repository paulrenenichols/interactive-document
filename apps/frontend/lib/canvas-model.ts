/**
 * Canvas model for slides: fixed aspect ratio, coordinate space, block position/size.
 * Used by the WYSIWYG editor; zoom/pan state lives in useEditorStore.
 */

import { BlockPositionSchema, type BlockPosition, type Block } from './schemas';

/** Slide canvas dimensions in "canvas units" (logical pixels). 16:9 aspect ratio. */
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

/** Default block size and vertical stacking for blocks without layout. */
const DEFAULT_BLOCK_WIDTH = 400;
const DEFAULT_TEXT_HEIGHT = 100;
const DEFAULT_CHART_HEIGHT = 280;
const BLOCK_GAP = 24;
const MARGIN = 40;

/**
 * Returns position and size for a block. Uses block.layout (x, y, width, height) when
 * valid; otherwise defaults to a stacked layout.
 */
export function getBlockPosition(block: Block, index: number): BlockPosition {
  const raw = block.layout as Record<string, unknown> | null | undefined;
  if (raw && typeof raw.x === 'number' && typeof raw.y === 'number' && typeof raw.width === 'number' && typeof raw.height === 'number') {
    const parsed = BlockPositionSchema.safeParse({ x: raw.x, y: raw.y, width: raw.width, height: raw.height });
    if (parsed.success) return parsed.data;
  }
  const height = block.type === 'chart' ? DEFAULT_CHART_HEIGHT : DEFAULT_TEXT_HEIGHT;
  const y = MARGIN + index * (height + BLOCK_GAP);
  return {
    x: MARGIN,
    y,
    width: DEFAULT_BLOCK_WIDTH,
    height,
  };
}

/**
 * Layout payload to persist for a block (for useUpdateBlock layout field).
 */
export function layoutFromPosition(pos: BlockPosition): Record<string, unknown> {
  return { x: pos.x, y: pos.y, width: pos.width, height: pos.height };
}
