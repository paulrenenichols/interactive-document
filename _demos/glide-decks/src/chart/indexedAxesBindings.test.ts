import { describe, expect, it } from "vitest";
import {
  normalizeIndexedAxesConfig,
  setIndexedSecondaryAxes,
  syncIndexedLayers,
  toRechartsAxisIds,
} from "./indexedAxesBindings";
import type { ChartBindingsState, IndexedLayerRow } from "../types/chartBindings";

describe("indexedAxesBindings", () => {
  it("defaults secondary flags off and primary assignments", () => {
    const s = normalizeIndexedAxesConfig(2, undefined);
    expect(s.secondaryX).toBe(false);
    expect(s.secondaryY).toBe(false);
    expect(s.layerAssignments).toEqual([
      { x: "primary", y: "primary" },
      { x: "primary", y: "primary" },
    ]);
  });

  it("syncIndexedLayers preserves and pads assignments when layers grow", () => {
    const prev: Extract<ChartBindingsState, { mode: "indexed_layers" }> = {
      mode: "indexed_layers",
      layers: [{ x: "a", y: "b" }],
      indexedAxes: {
        secondaryX: true,
        secondaryY: false,
        layerAssignments: [{ x: "secondary", y: "primary" }],
      },
    };
    const row2: IndexedLayerRow = { x: null, y: null };
    const next = syncIndexedLayers(prev, [...prev.layers, row2]);
    expect(next.layers).toHaveLength(2);
    expect(next.indexedAxes?.layerAssignments).toHaveLength(2);
    expect(next.indexedAxes?.layerAssignments?.[0]).toEqual({ x: "secondary", y: "primary" });
    expect(next.indexedAxes?.layerAssignments?.[1]).toEqual({ x: "primary", y: "primary" });
  });

  it("setIndexedSecondaryAxes clamps X to primary when secondary X off", () => {
    const prev: Extract<ChartBindingsState, { mode: "indexed_layers" }> = {
      mode: "indexed_layers",
      layers: [{ x: "a", y: "b" }],
      indexedAxes: {
        secondaryX: true,
        secondaryY: true,
        layerAssignments: [{ x: "secondary", y: "secondary" }],
      },
    };
    const next = setIndexedSecondaryAxes(prev, { secondaryX: false });
    expect(next.indexedAxes?.secondaryX).toBe(false);
    expect(next.indexedAxes?.layerAssignments?.[0]?.x).toBe("primary");
    expect(next.indexedAxes?.layerAssignments?.[0]?.y).toBe("secondary");
  });

  it("toRechartsAxisIds maps to fixed Recharts ids", () => {
    expect(toRechartsAxisIds({ x: "primary", y: "primary" }, true, true)).toEqual({
      xAxisId: "xPrimary",
      yAxisId: "yPrimary",
    });
    expect(toRechartsAxisIds({ x: "secondary", y: "secondary" }, true, true)).toEqual({
      xAxisId: "xSecondary",
      yAxisId: "ySecondary",
    });
  });
});
