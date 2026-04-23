import { describe, expect, it } from "vitest";
import { createProjectSeriesValueResolver } from "../data/seriesValueResolver";
import type { DataSeriesAssetRow } from "../types/dataModel";
import type { ChartBindingsState } from "../types/chartBindings";
import {
  buildChartPreviewPayload,
  catalogByName,
  sanitizePointLabelForRender,
} from "./chartBindingPreviewData";
import { CHART_PREVIEW_MAX_POINT_LABELS } from "./chartLimits";

function assetRow(name: string, valueType: DataSeriesAssetRow["value_type"], length: number): DataSeriesAssetRow {
  return { name, value_type: valueType, length, origin_kind: "manual", role_kind: "none" };
}

describe("sanitizePointLabelForRender", () => {
  it("returns null for null and undefined", () => {
    expect(sanitizePointLabelForRender(null)).toBeNull();
    expect(sanitizePointLabelForRender(undefined)).toBeNull();
  });

  it("returns null for empty or whitespace-only strings", () => {
    expect(sanitizePointLabelForRender("")).toBeNull();
    expect(sanitizePointLabelForRender("   ")).toBeNull();
    expect(sanitizePointLabelForRender("\t\n")).toBeNull();
  });

  it("returns trimmed text for non-empty content", () => {
    expect(sanitizePointLabelForRender("  hi  ")).toBe("hi");
    expect(sanitizePointLabelForRender("x")).toBe("x");
  });
});

describe("buildIndexedLayersData point labels", () => {
  it("assigns at most CHART_PREVIEW_MAX_POINT_LABELS labels in layer/point order and sets truncated", () => {
    const n = CHART_PREVIEW_MAX_POINT_LABELS + 5;
    const xs = Array.from({ length: n }, (_, i) => String(i));
    const ys = Array.from({ length: n }, (_, i) => String(i * 2));
    const labs = Array.from({ length: n }, (_, i) => `p${i}`);

    const bindings: ChartBindingsState = {
      mode: "indexed_layers",
      layers: [{ x: "sx", y: "sy", label: "slab" }],
    };
    const cat = catalogByName([
      assetRow("sx", "numeric", n),
      assetRow("sy", "numeric", n),
      assetRow("slab", "text", n),
    ]);
    const resolver = createProjectSeriesValueResolver(
      new Map<string, readonly string[]>([
        ["sx", xs],
        ["sy", ys],
        ["slab", labs],
      ]),
    );

    const payload = buildChartPreviewPayload("scatter", bindings, cat, resolver);
    expect(payload?.type).toBe("indexed");
    if (payload?.type !== "indexed") throw new Error("expected indexed");
    const pts = payload.data.layers[0]!.points;
    const withLabel = pts.filter((p) => p.label != null);
    expect(withLabel).toHaveLength(CHART_PREVIEW_MAX_POINT_LABELS);
    expect(withLabel.map((p) => p.label)).toEqual(labs.slice(0, CHART_PREVIEW_MAX_POINT_LABELS));
    expect(pts.every((p, i) => (i < CHART_PREVIEW_MAX_POINT_LABELS ? p.label === `p${i}` : p.label === undefined))).toBe(
      true,
    );
    expect(payload.data.pointLabelsTruncated).toBe(true);
  });

  it("does not count empty or whitespace labels toward the cap", () => {
    const labs = ["a", "   ", "", "\t", "b", "c"];
    const n = labs.length;
    const xs = labs.map((_, i) => String(i));
    const ys = labs.map((_, i) => String(i));

    const bindings: ChartBindingsState = {
      mode: "indexed_layers",
      layers: [{ x: "sx", y: "sy", label: "slab" }],
    };
    const cat = catalogByName([
      assetRow("sx", "numeric", n),
      assetRow("sy", "numeric", n),
      assetRow("slab", "text", n),
    ]);
    const resolver = createProjectSeriesValueResolver(
      new Map<string, readonly string[]>([
        ["sx", xs],
        ["sy", ys],
        ["slab", labs],
      ]),
    );

    const payload = buildChartPreviewPayload("scatter", bindings, cat, resolver);
    expect(payload?.type).toBe("indexed");
    if (payload?.type !== "indexed") throw new Error("expected indexed");
    const pts = payload.data.layers[0]!.points;
    expect(pts[0]!.label).toBe("a");
    expect(pts[1]!.label).toBeUndefined();
    expect(pts[2]!.label).toBeUndefined();
    expect(pts[3]!.label).toBeUndefined();
    expect(pts[4]!.label).toBe("b");
    expect(pts[5]!.label).toBe("c");
    expect(payload.data.pointLabelsTruncated).toBe(false);
  });

  it("applies cap across layers in order", () => {
    const n1 = 30;
    const n2 = 30;
    const xs1 = Array.from({ length: n1 }, (_, i) => String(i));
    const ys1 = Array.from({ length: n1 }, (_, i) => String(i));
    const lab1 = xs1.map((_, i) => `A${i}`);
    const xs2 = Array.from({ length: n2 }, (_, i) => String(i + 100));
    const ys2 = Array.from({ length: n2 }, (_, i) => String(i));
    const lab2 = xs2.map((_, i) => `B${i}`);

    const bindings: ChartBindingsState = {
      mode: "indexed_layers",
      layers: [
        { x: "sx1", y: "sy1", label: "sl1" },
        { x: "sx2", y: "sy2", label: "sl2" },
      ],
    };
    const cat = catalogByName([
      assetRow("sx1", "numeric", n1),
      assetRow("sy1", "numeric", n1),
      assetRow("sl1", "text", n1),
      assetRow("sx2", "numeric", n2),
      assetRow("sy2", "numeric", n2),
      assetRow("sl2", "text", n2),
    ]);
    const resolver = createProjectSeriesValueResolver(
      new Map<string, readonly string[]>([
        ["sx1", xs1],
        ["sy1", ys1],
        ["sl1", lab1],
        ["sx2", xs2],
        ["sy2", ys2],
        ["sl2", lab2],
      ]),
    );

    const payload = buildChartPreviewPayload("scatter", bindings, cat, resolver);
    expect(payload?.type).toBe("indexed");
    if (payload?.type !== "indexed") throw new Error("expected indexed");
    const [layer0, layer1] = payload.data.layers;
    expect(layer0!.points.filter((p) => p.label != null)).toHaveLength(30);
    expect(layer1!.points.filter((p) => p.label != null)).toHaveLength(20);
    expect(layer1!.points[20]!.label).toBeUndefined();
    expect(payload.data.pointLabelsTruncated).toBe(true);
  });
});
