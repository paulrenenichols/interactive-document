import { getChartContract } from "./chartSlotContracts";
import type { ChartAppearanceLayout, ChartCreationKind } from "../types/dataModel";
import { aspectResizeRectWithoutSlideClamp, type ResizeHandleId } from "../slideDeck/slideTextBoxResizeEmu";

/** Matches AppShell `Toolbar` minHeight + main `mt` offset. */
export const CHART_DESIGN_MODAL_TOP_OFFSET_PX = 48;

export const CHART_DESIGN_MIN_WIDTH_PX = 120;
export const CHART_DESIGN_MIN_HEIGHT_PX = 80;

export const CHART_DESIGN_DEFAULT_FRAME_WIDTH_PX = 430;

export type ChartResizeHandle =
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

function roundLayout(f: ChartAppearanceLayout): ChartAppearanceLayout {
  const w = Math.round(f.widthPx);
  const h = Math.round(f.heightPx);
  const base: ChartAppearanceLayout = {
    offsetX: Math.round(f.offsetX),
    offsetY: Math.round(f.offsetY),
    widthPx: w,
    heightPx: h,
    aspectRatio: h > 0 ? w / h : f.aspectRatio,
  };
  return f.visual ? { ...base, visual: f.visual } : base;
}

export function normalizeAspectRatio(f: ChartAppearanceLayout): ChartAppearanceLayout {
  const { widthPx: w, heightPx: h } = f;
  return {
    ...f,
    aspectRatio: h > 0 ? w / h : f.aspectRatio,
  };
}

export function clampFrameToBounds(
  f: ChartAppearanceLayout,
  canvasW: number,
  canvasH: number,
  minW = CHART_DESIGN_MIN_WIDTH_PX,
  minH = CHART_DESIGN_MIN_HEIGHT_PX,
): ChartAppearanceLayout {
  const maxW = Math.max(minW, canvasW);
  const maxH = Math.max(minH, canvasH);
  let w = Math.min(Math.max(f.widthPx, minW), maxW);
  let h = Math.min(Math.max(f.heightPx, minH), maxH);
  let x = f.offsetX;
  let y = f.offsetY;

  if (w > canvasW) w = canvasW;
  if (h > canvasH) h = canvasH;
  x = Math.max(0, Math.min(x, canvasW - w));
  y = Math.max(0, Math.min(y, canvasH - h));

  return roundLayout(normalizeAspectRatio({ offsetX: x, offsetY: y, widthPx: w, heightPx: h, aspectRatio: w / h }));
}

export function clampDragToBounds(
  f: ChartAppearanceLayout,
  canvasW: number,
  canvasH: number,
): ChartAppearanceLayout {
  const w = f.widthPx;
  const h = f.heightPx;
  const x = Math.max(0, Math.min(f.offsetX, canvasW - w));
  const y = Math.max(0, Math.min(f.offsetY, canvasH - h));
  return roundLayout({ ...f, offsetX: x, offsetY: y });
}

/**
 * Resize frame from drag start and cumulative delta (pointer space).
 */
export function resizeFrameFromHandle(
  start: ChartAppearanceLayout,
  handle: ChartResizeHandle,
  dx: number,
  dy: number,
  canvasW: number,
  canvasH: number,
  minW = CHART_DESIGN_MIN_WIDTH_PX,
  minH = CHART_DESIGN_MIN_HEIGHT_PX,
): ChartAppearanceLayout {
  let x = start.offsetX;
  let y = start.offsetY;
  let w = start.widthPx;
  let h = start.heightPx;

  const hStr = handle as string;
  if (hStr.includes("e")) {
    w = start.widthPx + dx;
  }
  if (hStr.includes("w")) {
    const right = start.offsetX + start.widthPx;
    x = start.offsetX + dx;
    w = right - x;
  }
  if (hStr.includes("s")) {
    h = start.heightPx + dy;
  }
  if (hStr.includes("n")) {
    const bottom = start.offsetY + start.heightPx;
    y = start.offsetY + dy;
    h = bottom - y;
  }

  return clampFrameToBounds(
    normalizeAspectRatio({
      offsetX: x,
      offsetY: y,
      widthPx: w,
      heightPx: h,
      aspectRatio: w / h,
    }),
    canvasW,
    canvasH,
    minW,
    minH,
  );
}

/**
 * Same handle semantics as {@link resizeFrameFromHandle} but width:height stays equal to
 * `startFrame.widthPx / startFrame.heightPx` (Shift+resize from drag start).
 */
export function resizeFrameFromHandleAspectFromStart(
  start: ChartAppearanceLayout,
  handle: ChartResizeHandle,
  dx: number,
  dy: number,
  canvasW: number,
  canvasH: number,
  minW = CHART_DESIGN_MIN_WIDTH_PX,
  minH = CHART_DESIGN_MIN_HEIGHT_PX,
): ChartAppearanceLayout {
  const aspect = start.widthPx / Math.max(start.heightPx, 1);
  const r = aspectResizeRectWithoutSlideClamp(
    handle as ResizeHandleId,
    {
      x: start.offsetX,
      y: start.offsetY,
      width: start.widthPx,
      height: start.heightPx,
    },
    dx,
    dy,
    aspect,
  );
  return clampFrameToBounds(
    normalizeAspectRatio({
      ...start,
      offsetX: r.x,
      offsetY: r.y,
      widthPx: r.width,
      heightPx: r.height,
      aspectRatio: r.width / Math.max(r.height, 1),
    }),
    canvasW,
    canvasH,
    minW,
    minH,
  );
}

export function createDefaultChartAppearanceLayout(
  chartKind: ChartCreationKind,
  canvasW: number,
  canvasH: number,
): ChartAppearanceLayout {
  const aspect = getChartContract(chartKind).defaultAspectRatio;
  const widthPx = CHART_DESIGN_DEFAULT_FRAME_WIDTH_PX;
  const heightPx = widthPx / aspect;
  const centered: ChartAppearanceLayout = {
    offsetX: Math.max(0, (canvasW - widthPx) / 2),
    offsetY: Math.max(0, (canvasH - heightPx) / 2),
    widthPx,
    heightPx,
    aspectRatio: widthPx / heightPx,
  };
  return clampFrameToBounds(centered, canvasW, canvasH);
}
