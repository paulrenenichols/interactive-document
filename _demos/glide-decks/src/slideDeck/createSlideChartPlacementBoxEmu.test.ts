import { describe, expect, it } from "vitest";
import { CHART_DESIGN_DEFAULT_FRAME_WIDTH_PX } from "../chart/chartAppearanceLayout";
import type { ChartAppearanceLayout } from "../types/dataModel";
import { DEFAULT_SLIDE_HEIGHT_EMU, DEFAULT_SLIDE_WIDTH_EMU } from "../types/slideDeck/constants";
import { createSlideChartPlacementBoxEmu } from "./createSlideChartPlacementBoxEmu";

describe("createSlideChartPlacementBoxEmu", () => {
  it("matches legacy 16:9 centered box when appearance is omitted", () => {
    const a = createSlideChartPlacementBoxEmu();
    const b = createSlideChartPlacementBoxEmu(null);
    const w = Math.floor(DEFAULT_SLIDE_WIDTH_EMU * 0.45);
    const h = Math.floor((w * 9) / 16);
    expect(a).toEqual({
      x: Math.floor((DEFAULT_SLIDE_WIDTH_EMU - w) / 2),
      y: Math.floor((DEFAULT_SLIDE_HEIGHT_EMU - h) / 2),
      width: w,
      height: h,
    });
    expect(b).toEqual(a);
  });

  it("scales width from appearance vs default frame width and preserves aspect ratio", () => {
    const appearance: ChartAppearanceLayout = {
      offsetX: 0,
      offsetY: 0,
      widthPx: CHART_DESIGN_DEFAULT_FRAME_WIDTH_PX,
      heightPx: 300,
      aspectRatio: CHART_DESIGN_DEFAULT_FRAME_WIDTH_PX / 300,
    };
    const box = createSlideChartPlacementBoxEmu(appearance);
    const legacyW = Math.floor(DEFAULT_SLIDE_WIDTH_EMU * 0.45);
    expect(box.width).toBe(legacyW);
    expect(box.height).toBe(Math.round(legacyW / appearance.aspectRatio));
    expect(box.x).toBe(Math.floor((DEFAULT_SLIDE_WIDTH_EMU - box.width) / 2));
    expect(box.y).toBe(Math.floor((DEFAULT_SLIDE_HEIGHT_EMU - box.height) / 2));
  });

  it("halves EMU width when design frame is half the default reference width", () => {
    const appearance: ChartAppearanceLayout = {
      offsetX: 0,
      offsetY: 0,
      widthPx: CHART_DESIGN_DEFAULT_FRAME_WIDTH_PX / 2,
      heightPx: 150,
      aspectRatio: (CHART_DESIGN_DEFAULT_FRAME_WIDTH_PX / 2) / 150,
    };
    const box = createSlideChartPlacementBoxEmu(appearance);
    const legacy = createSlideChartPlacementBoxEmu();
    expect(box.width).toBe(Math.round(legacy.width / 2));
  });
});
