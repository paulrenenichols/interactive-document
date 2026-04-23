import { describe, expect, it } from "vitest";
import { formatAxisTickNumber } from "../numericFormat";
import { tokens } from "../theme/tokens";
import { createEmptyBindings } from "./chartSlotContracts";
import {
  axisExpectsNumericTicks,
  createDefaultChartVisualAppearance,
  deriveAutoAxisLabel,
  deriveAxisFormatSourceSeriesName,
  getDesignAxisDescriptors,
  mergeAppearanceWithVisualDefaults,
  resolveChartTitleDisplayText,
} from "./chartAppearanceVisual";
import type { ChartAppearanceLayout } from "../types/dataModel";
import type { ChartBindingsState } from "../types/chartBindings";

const emptyLayout = (): ChartAppearanceLayout => ({
  widthPx: 400,
  heightPx: 300,
  offsetX: 0,
  offsetY: 0,
  aspectRatio: 400 / 300,
});

function catalogFromNames(names: string[]): Map<string, import("../types/dataModel").DataSeriesAssetRow> {
  const m = new Map<string, import("../types/dataModel").DataSeriesAssetRow>();
  for (const n of names) {
    m.set(n, {
      name: n,
      value_type: "numeric",
      length: 0,
      origin_kind: "manual",
      role_kind: "none",
    });
  }
  return m;
}

describe("getDesignAxisDescriptors", () => {
  it("returns empty for pie", () => {
    const b = createEmptyBindings("pie");
    expect(getDesignAxisDescriptors("pie", b)).toEqual([]);
  });

  it("returns primary X/Y for scatter indexed", () => {
    const b = createEmptyBindings("scatter");
    const d = getDesignAxisDescriptors("scatter", b);
    expect(d.map((x) => x.id)).toEqual(["xPrimary", "yPrimary"]);
  });

  it("includes secondary axes when enabled in bindings", () => {
    const b: ChartBindingsState = {
      mode: "indexed_layers",
      layers: [{ x: null, y: null, label: null }],
      indexedAxes: { secondaryX: true, secondaryY: true, layerAssignments: [{ x: "primary", y: "primary" }] },
    };
    const ids = getDesignAxisDescriptors("scatter", b).map((x) => x.id);
    expect(ids).toEqual(["xPrimary", "yPrimary", "xSecondary", "ySecondary"]);
  });
});

describe("createDefaultChartVisualAppearance", () => {
  it("uses 20pt title, theme border axis color, and kind-specific plot margin", () => {
    const scatter = createDefaultChartVisualAppearance("scatter", createEmptyBindings("scatter"), "C");
    expect(scatter.title.titleFontSizePt).toBe(20);
    expect(scatter.plotMargin).toEqual({ top: 20, right: 10, bottom: 44, left: 75 });
    expect(scatter.axes.xPrimary?.axisColor).toBe(tokens.colorChartLines);
    const bar = createDefaultChartVisualAppearance("v_bar_cluster", createEmptyBindings("v_bar_cluster"), "C");
    expect(bar.plotMargin).toEqual({ top: 20, right: 10, bottom: 44, left: 8 });
    expect(scatter.axes.xPrimary?.tickMarkDisplay).toBe("cross");
    expect(scatter.axes.xPrimary?.showTickLabels).toBe(true);
    expect(scatter.axes.xPrimary?.numericFormatOverride).toBeNull();
  });
});

describe("mergeAppearanceWithVisualDefaults", () => {
  it("adds full visual when missing", () => {
    const out = mergeAppearanceWithVisualDefaults(emptyLayout(), "scatter", createEmptyBindings("scatter"), "My Chart");
    expect(out.visual?.title.titleText).toBe("My Chart");
    expect(out.visual?.axes.xPrimary).toBeDefined();
    expect(out.visual?.dataPointLabels.show).toBe(false);
  });

  it("preserves user title when visual partial", () => {
    const layout: ChartAppearanceLayout = {
      ...emptyLayout(),
      visual: {
        title: {
          showTitle: true,
          titlePosition: "above_plot",
          titleFontFamily: '"Poppins", sans-serif',
          titleFontSizePt: 14,
          titleText: "Locked",
          titleSource: "user",
          titleOffsetXPx: 0,
          titleOffsetYPx: 0,
        },
        plotMargin: { top: 8, right: 10, bottom: 10, left: 8 },
        axes: {},
        dataPointLabels: {
          show: false,
          fontFamily: '"Poppins", sans-serif',
          fontSizePt: 12,
        },
      },
    };
    const out = mergeAppearanceWithVisualDefaults(layout, "scatter", createEmptyBindings("scatter"), "Other");
    expect(out.visual?.title.titleText).toBe("Locked");
    expect(out.visual?.title.titleSource).toBe("user");
  });
});

describe("resolveChartTitleDisplayText", () => {
  const v = createDefaultChartVisualAppearance("scatter", createEmptyBindings("scatter"), "A");
  it("follows chart name when auto", () => {
    expect(resolveChartTitleDisplayText(v, "Renamed")).toBe("Renamed");
  });
  it("uses stored text when user", () => {
    const u = {
      ...v,
      title: { ...v.title, titleSource: "user" as const, titleText: "Custom" },
    };
    expect(resolveChartTitleDisplayText(u, "Renamed")).toBe("Custom");
  });
});

describe("deriveAutoAxisLabel", () => {
  it("uses first layer x and y for indexed scatter", () => {
    const b: ChartBindingsState = {
      mode: "indexed_layers",
      layers: [{ x: "sx", y: "sy", label: null }],
    };
    const cat = catalogFromNames(["sx", "sy"]);
    expect(deriveAutoAxisLabel("xPrimary", "scatter", b, cat)).toBe("sx");
    expect(deriveAutoAxisLabel("yPrimary", "scatter", b, cat)).toBe("sy");
  });

  it("uses category and first value for vertical bar", () => {
    const b: ChartBindingsState = {
      mode: "category_values",
      category: "cat1",
      values: ["v1", null],
    };
    const cat = catalogFromNames(["cat1", "v1"]);
    expect(deriveAutoAxisLabel("xPrimary", "v_bar_cluster", b, cat)).toBe("cat1");
    expect(deriveAutoAxisLabel("yPrimary", "v_bar_cluster", b, cat)).toBe("v1");
  });
});

describe("deriveAxisFormatSourceSeriesName", () => {
  it("uses first layer x and y for indexed charts", () => {
    const b: ChartBindingsState = {
      mode: "indexed_layers",
      layers: [{ x: "sx", y: "sy", label: null }],
    };
    expect(deriveAxisFormatSourceSeriesName("xPrimary", "scatter", b)).toBe("sx");
    expect(deriveAxisFormatSourceSeriesName("yPrimary", "scatter", b)).toBe("sy");
  });

  it("returns null for category axis on vertical bar", () => {
    const b: ChartBindingsState = {
      mode: "category_values",
      category: "cat1",
      values: ["v1", null],
    };
    expect(deriveAxisFormatSourceSeriesName("xPrimary", "v_bar_cluster", b)).toBeNull();
    expect(deriveAxisFormatSourceSeriesName("yPrimary", "v_bar_cluster", b)).toBe("v1");
  });
});

describe("axisExpectsNumericTicks", () => {
  it("marks numeric vs category axes for category_values", () => {
    expect(
      axisExpectsNumericTicks("xPrimary", "v_bar_cluster", {
        payloadKind: "category_values",
        horizontalBar: false,
      }),
    ).toBe(false);
    expect(
      axisExpectsNumericTicks("yPrimary", "v_bar_cluster", {
        payloadKind: "category_values",
        horizontalBar: false,
      }),
    ).toBe(true);
  });
});

describe("formatAxisTickNumber", () => {
  it("prefers override over series format", () => {
    const s = formatAxisTickNumber(5, {
      override: "excel:0.00",
      seriesCanonical: "excel:0",
    });
    expect(s).toBe("5.00");
  });
});
