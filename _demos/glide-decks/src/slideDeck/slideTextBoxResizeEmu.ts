import { DEFAULT_SLIDE_HEIGHT_EMU, DEFAULT_SLIDE_WIDTH_EMU } from "../types/slideDeck/constants";

export type ResizeHandleId = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/** Chart corner handles — same IDs as {@link ResizeHandleId} corners. */
export type ChartCornerHandleId = "nw" | "ne" | "sw" | "se";

/** Minimum text box size in EMU (~0.16 in). */
export const MIN_TEXT_BOX_EMU = 150_000;

export function clampSlideElementRectEmu(rect: {
  x: number;
  y: number;
  width: number;
  height: number;
}): { x: number; y: number; width: number; height: number } {
  const maxW = DEFAULT_SLIDE_WIDTH_EMU;
  const maxH = DEFAULT_SLIDE_HEIGHT_EMU;
  let { x, y, width: w, height: h } = rect;
  w = Math.max(MIN_TEXT_BOX_EMU, Math.min(w, maxW));
  h = Math.max(MIN_TEXT_BOX_EMU, Math.min(h, maxH));
  x = Math.max(0, Math.min(x, maxW - w));
  y = Math.max(0, Math.min(y, maxH - h));
  w = Math.min(w, maxW - x);
  h = Math.min(h, maxH - y);
  return { x, y, width: w, height: h };
}

export function moveSlideElementEmu(
  rect: { x: number; y: number; width: number; height: number },
  dx: number,
  dy: number,
): { x: number; y: number; width: number; height: number } {
  return clampSlideElementRectEmu({
    x: rect.x + dx,
    y: rect.y + dy,
    width: rect.width,
    height: rect.height,
  });
}

/**
 * `dx`/`dy` are pointer deltas in slide EMU (positive x = right, positive y = down).
 */
export function applyResizeHandleDeltaEmu(
  handle: ResizeHandleId,
  rect: { x: number; y: number; width: number; height: number },
  dx: number,
  dy: number,
): { x: number; y: number; width: number; height: number } {
  let { x, y, width: w, height: h } = rect;

  switch (handle) {
    case "e":
      return clampSlideElementRectEmu({ x, y, width: w + dx, height: h });
    case "w":
      return clampSlideElementRectEmu({ x: x + dx, y, width: w - dx, height: h });
    case "n":
      return clampSlideElementRectEmu({ x, y: y + dy, width: w, height: h - dy });
    case "s":
      return clampSlideElementRectEmu({ x, y, width: w, height: h + dy });
    case "ne":
      return clampSlideElementRectEmu({ x, y: y + dy, width: w + dx, height: h - dy });
    case "nw":
      return clampSlideElementRectEmu({ x: x + dx, y: y + dy, width: w - dx, height: h - dy });
    case "se":
      return clampSlideElementRectEmu({ x, y, width: w + dx, height: h + dy });
    case "sw":
      return clampSlideElementRectEmu({ x: x + dx, y, width: w - dx, height: h + dy });
    default:
      return clampSlideElementRectEmu({ x, y, width: w, height: h });
  }
}

/**
 * Aspect-locked resize without slide bounds clamping. Used for Shift+resize (ratio = drag-start box)
 * and for chart design canvas (caller clamps with px bounds).
 *
 * `aspectWidthOverHeight` defaults to `start.width / start.height` (ratio at drag start).
 * Edge handles keep the opposite edge fixed on the active axis and center on the orthogonal axis.
 */
export function aspectResizeRectWithoutSlideClamp(
  handle: ResizeHandleId,
  start: { x: number; y: number; width: number; height: number },
  dx: number,
  dy: number,
  aspectWidthOverHeight?: number,
): { x: number; y: number; width: number; height: number } {
  const { x: sx, y: sy, width: sw, height: sh } = start;
  const aspect =
    aspectWidthOverHeight != null && aspectWidthOverHeight > 0
      ? aspectWidthOverHeight
      : sw / Math.max(sh, 1);
  const bottom = sy + sh;

  switch (handle) {
    case "se": {
      const w = sw + dx;
      const h = w / aspect;
      return { x: sx, y: sy, width: w, height: h };
    }
    case "nw": {
      const w = sw - dx;
      const h = w / aspect;
      return { x: sx + dx, y: bottom - h, width: w, height: h };
    }
    case "ne": {
      const w = sw + dx;
      const h = w / aspect;
      return { x: sx, y: bottom - h, width: w, height: h };
    }
    case "sw": {
      const w = sw - dx;
      const h = w / aspect;
      return { x: sx + dx, y: sy, width: w, height: h };
    }
    case "e": {
      const w = sw + dx;
      const h = w / aspect;
      const y = sy + (sh - h) / 2;
      return { x: sx, y, width: w, height: h };
    }
    case "w": {
      const w = sw - dx;
      const h = w / aspect;
      const y = sy + (sh - h) / 2;
      return { x: sx + dx, y, width: w, height: h };
    }
    case "s": {
      const h = sh + dy;
      const w = h * aspect;
      const x = sx + (sw - w) / 2;
      return { x, y: sy, width: w, height: h };
    }
    case "n": {
      const h = sh - dy;
      const w = h * aspect;
      const x = sx + (sw - w) / 2;
      return { x, y: sy + dy, width: w, height: h };
    }
    default:
      return { x: sx, y: sy, width: sw, height: sh };
  }
}

/**
 * Like {@link applyResizeHandleDeltaEmu} but keeps width/height ratio equal to the start rect’s ratio
 * (Shift+resize from drag start).
 */
export function applyResizeHandleDeltaEmuWithAspect(
  handle: ResizeHandleId,
  start: { x: number; y: number; width: number; height: number },
  dx: number,
  dy: number,
): { x: number; y: number; width: number; height: number } {
  const r = aspectResizeRectWithoutSlideClamp(handle, start, dx, dy);
  if (r.width < MIN_TEXT_BOX_EMU || r.height < MIN_TEXT_BOX_EMU) {
    return clampSlideElementRectEmu({ x: start.x, y: start.y, width: start.width, height: start.height });
  }
  return clampSlideElementRectEmu(r);
}

/**
 * Cumulative pointer delta in slide EMU from drag start (`start` rect).
 * Preserves aspect ratio: `lockedAspectRatio` (width/height) when provided and positive,
 * otherwise `start.width / start.height`.
 */
export function applyCornerAspectResizeEmu(
  handle: ChartCornerHandleId,
  start: { x: number; y: number; width: number; height: number },
  dx: number,
  _dy: number,
  lockedAspectRatio?: number,
): { x: number; y: number; width: number; height: number } {
  const aspect =
    lockedAspectRatio != null && lockedAspectRatio > 0 ? lockedAspectRatio : start.width / start.height;
  const r = aspectResizeRectWithoutSlideClamp(handle, start, dx, 0, aspect);
  if (r.width < MIN_TEXT_BOX_EMU || r.height < MIN_TEXT_BOX_EMU) {
    return clampSlideElementRectEmu({ x: start.x, y: start.y, width: start.width, height: start.height });
  }
  return clampSlideElementRectEmu(r);
}
