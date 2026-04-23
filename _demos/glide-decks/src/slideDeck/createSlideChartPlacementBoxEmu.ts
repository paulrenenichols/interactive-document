import { CHART_DESIGN_DEFAULT_FRAME_WIDTH_PX } from "../chart/chartAppearanceLayout";
import type { ChartAppearanceLayout } from "../types/dataModel";
import { DEFAULT_SLIDE_HEIGHT_EMU, DEFAULT_SLIDE_WIDTH_EMU } from "../types/slideDeck/constants";
import { clampSlideElementRectEmu } from "./slideTextBoxResizeEmu";

/** Default chart placement: ~45% slide width, 16:9 aspect, centered. */
const WIDTH_FRAC = 0.45;
const ASPECT_W = 16;
const ASPECT_H = 9;

function legacyCenteredBox(): { x: number; y: number; width: number; height: number } {
  const w = Math.floor(DEFAULT_SLIDE_WIDTH_EMU * WIDTH_FRAC);
  const h = Math.floor((w * ASPECT_H) / ASPECT_W);
  const x = Math.floor((DEFAULT_SLIDE_WIDTH_EMU - w) / 2);
  const y = Math.floor((DEFAULT_SLIDE_HEIGHT_EMU - h) / 2);
  return { x, y, width: w, height: h };
}

/**
 * EMU box for a new chart on the slide (centered).
 * When `appearance` is set, width scales from the chart design frame relative to
 * {@link CHART_DESIGN_DEFAULT_FRAME_WIDTH_PX} (~45% slide width at 430px); height follows `aspectRatio`.
 * Otherwise uses legacy ~45% × 16:9.
 */
export function createSlideChartPlacementBoxEmu(appearance?: ChartAppearanceLayout | null): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (!appearance || appearance.widthPx <= 0) {
    return legacyCenteredBox();
  }

  const refW = CHART_DESIGN_DEFAULT_FRAME_WIDTH_PX;
  const emuW = Math.round((appearance.widthPx / refW) * WIDTH_FRAC * DEFAULT_SLIDE_WIDTH_EMU);
  let aspect = appearance.aspectRatio;
  if (!(aspect > 0) && appearance.heightPx > 0) {
    aspect = appearance.widthPx / appearance.heightPx;
  }
  if (!(aspect > 0)) {
    return legacyCenteredBox();
  }
  const emuH = Math.round(emuW / aspect);

  const rect = clampSlideElementRectEmu({ x: 0, y: 0, width: emuW, height: emuH });
  const x = Math.floor((DEFAULT_SLIDE_WIDTH_EMU - rect.width) / 2);
  const y = Math.floor((DEFAULT_SLIDE_HEIGHT_EMU - rect.height) / 2);
  return clampSlideElementRectEmu({ x, y, width: rect.width, height: rect.height });
}
