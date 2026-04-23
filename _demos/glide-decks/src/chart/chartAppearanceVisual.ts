import { normalizeIndexedAxesConfig } from "./indexedAxesBindings";
import { tokens } from "../theme/tokens";
import type {
  AxisVisualConfig,
  ChartAppearanceLayout,
  ChartCreationKind,
  ChartDataPointLabelsConfig,
  ChartDesignAxisId,
  ChartPlotMargin,
  ChartTitleVisualConfig,
  ChartVisualAppearance,
  DataSeriesAssetRow,
} from "../types/dataModel";
import type { ChartBindingsState } from "../types/chartBindings";

/** App default — matches `appTheme.typography.fontFamily`. */
export const DEFAULT_CHART_FONT_FAMILY = '"Poppins", sans-serif';

export const CHART_DESIGN_FONT_CHOICES: readonly string[] = [
  DEFAULT_CHART_FONT_FAMILY,
  '"JetBrains Mono", monospace',
];

/** Base Recharts margin — `left` / `bottom` may be widened per chart kind via {@link defaultPlotMarginForChartKind}. */
export const DEFAULT_CHART_PLOT_MARGIN: ChartPlotMargin = {
  top: 20,
  right: 10,
  bottom: 10,
  left: 8,
};

/** Pie/donut: no Cartesian X-axis title below tick band. */
const PIE_DONUT_PLOT_MARGIN_BOTTOM_PX = 10;

/** Cartesian charts: X-axis title uses `position="bottom"` below the tick band — reserve space. */
const CARTESIAN_DEFAULT_PLOT_MARGIN_BOTTOM_PX = 44;

/** Scatter, line (1D/2D), bubble: extra left space for the Y-axis label band. */
const CHART_KINDS_WIDE_LEFT_PLOT_MARGIN: ReadonlySet<ChartCreationKind> = new Set([
  "scatter",
  "line_2d",
  "line_1d",
  "bubble",
]);

/** Default `plotMargin` for a chart kind (e.g. wider `left` for Cartesian XY-style charts). */
export function defaultPlotMarginForChartKind(chartKind: ChartCreationKind): ChartPlotMargin {
  const left = CHART_KINDS_WIDE_LEFT_PLOT_MARGIN.has(chartKind) ? 75 : DEFAULT_CHART_PLOT_MARGIN.left;
  const bottom =
    chartKind === "pie" || chartKind === "donut" ? PIE_DONUT_PLOT_MARGIN_BOTTOM_PX : CARTESIAN_DEFAULT_PLOT_MARGIN_BOTTOM_PX;
  return { ...DEFAULT_CHART_PLOT_MARGIN, left, bottom };
}

export interface DesignAxisDescriptor {
  id: ChartDesignAxisId;
  label: string;
}

export function getDesignAxisDescriptors(
  chartKind: ChartCreationKind,
  bindings: ChartBindingsState,
): DesignAxisDescriptor[] {
  if (chartKind === "pie" || chartKind === "donut") return [];
  if (bindings.mode === "indexed_layers") {
    const norm = normalizeIndexedAxesConfig(bindings.layers.length, bindings.indexedAxes);
    const out: DesignAxisDescriptor[] = [
      { id: "xPrimary", label: "X Axis Primary" },
      { id: "yPrimary", label: "Y Axis Primary" },
    ];
    if (norm.secondaryX) out.push({ id: "xSecondary", label: "X Axis Secondary" });
    if (norm.secondaryY) out.push({ id: "ySecondary", label: "Y Axis Secondary" });
    return out;
  }
  return [
    { id: "xPrimary", label: "X Axis Primary" },
    { id: "yPrimary", label: "Y Axis Primary" },
  ];
}

export function createDefaultAxisVisual(isPrimary: boolean): AxisVisualConfig {
  return {
    showAxis: isPrimary,
    axisColor: tokens.colorChartLines,
    axisThicknessPx: 2,
    showLabel: isPrimary,
    labelText: "",
    labelSource: "auto",
    labelAngleDeg: 0,
    labelFontFamily: DEFAULT_CHART_FONT_FAMILY,
    labelFontSizePt: 12,
    tickMarkDisplay: "cross",
    showTickLabels: true,
    numericFormatOverride: null,
  };
}

export function createDefaultDataPointLabelsVisual(): ChartDataPointLabelsConfig {
  return {
    show: false,
    fontFamily: DEFAULT_CHART_FONT_FAMILY,
    fontSizePt: 12,
  };
}

export function createDefaultTitleVisual(chartName: string): ChartTitleVisualConfig {
  const t = chartName.trim();
  return {
    showTitle: true,
    titlePosition: "above_plot",
    titleFontFamily: DEFAULT_CHART_FONT_FAMILY,
    titleFontSizePt: 20,
    titleText: t || "Chart",
    titleSource: "auto",
    titleOffsetXPx: 0,
    titleOffsetYPx: 0,
  };
}

/** Merged axis config for preview/render when `visual` is partial or absent. */
export function effectiveAxisVisual(
  axisId: ChartDesignAxisId,
  designVisual: ChartVisualAppearance | undefined,
  isPrimaryAxis: boolean,
): AxisVisualConfig {
  const base = createDefaultAxisVisual(isPrimaryAxis);
  const partial = designVisual?.axes?.[axisId];
  return partial ? { ...base, ...partial } : base;
}

/**
 * Whether tick values for this axis are numeric (vs category labels), for format inheritance and tick formatters.
 */
export function axisExpectsNumericTicks(
  axisId: ChartDesignAxisId,
  chartKind: ChartCreationKind,
  options: { payloadKind: "indexed" | "category_values"; horizontalBar?: boolean },
): boolean {
  if (options.payloadKind === "indexed") {
    return true;
  }
  if (chartKind === "line_1d") {
    return axisId === "yPrimary";
  }
  const horizontal = options.horizontalBar ?? false;
  if (horizontal) {
    return axisId === "xPrimary";
  }
  return axisId === "yPrimary";
}

export function createDefaultChartVisualAppearance(
  chartKind: ChartCreationKind,
  bindings: ChartBindingsState,
  chartName: string,
): ChartVisualAppearance {
  const descriptors = getDesignAxisDescriptors(chartKind, bindings);
  const axes: Partial<Record<ChartDesignAxisId, AxisVisualConfig>> = {};
  for (const d of descriptors) {
    const isPrimary = d.id === "xPrimary" || d.id === "yPrimary";
    axes[d.id] = createDefaultAxisVisual(isPrimary);
  }
  return {
    title: createDefaultTitleVisual(chartName),
    plotMargin: { ...defaultPlotMarginForChartKind(chartKind) },
    axes,
    dataPointLabels: createDefaultDataPointLabelsVisual(),
  };
}

function deepMergeTitle(partial: Partial<ChartTitleVisualConfig> | undefined, base: ChartTitleVisualConfig): ChartTitleVisualConfig {
  if (!partial) return { ...base };
  return { ...base, ...partial };
}

function deepMergeAxis(partial: Partial<AxisVisualConfig> | undefined, base: AxisVisualConfig): AxisVisualConfig {
  if (!partial) return { ...base };
  return { ...base, ...partial };
}

function deepMergePlotMargin(partial: Partial<ChartPlotMargin> | undefined, base: ChartPlotMargin): ChartPlotMargin {
  if (!partial) return { ...base };
  return { ...base, ...partial };
}

function deepMergeDataPointLabels(
  partial: Partial<ChartDataPointLabelsConfig> | undefined,
  base: ChartDataPointLabelsConfig,
): ChartDataPointLabelsConfig {
  if (!partial) return { ...base };
  return { ...base, ...partial };
}

/** Applies a functional update to `appearance.visual` after merging with defaults. */
export function patchChartAppearanceVisual(
  appearance: ChartAppearanceLayout,
  chartKind: ChartCreationKind,
  bindings: ChartBindingsState,
  chartName: string,
  patch: (v: ChartVisualAppearance) => ChartVisualAppearance,
): ChartAppearanceLayout {
  const m = mergeAppearanceWithVisualDefaults(appearance, chartKind, bindings, chartName);
  return { ...appearance, visual: patch(m.visual!) };
}

/**
 * Merges persisted `appearance.visual` with defaults for the current chart kind and bindings.
 * Legacy rows without `visual` get full defaults.
 */
export function mergeAppearanceWithVisualDefaults(
  appearance: ChartAppearanceLayout,
  chartKind: ChartCreationKind,
  bindings: ChartBindingsState,
  chartName: string,
): ChartAppearanceLayout {
  const defaults = createDefaultChartVisualAppearance(chartKind, bindings, chartName);
  const v = appearance.visual;
  if (!v) {
    return { ...appearance, visual: defaults };
  }
  const descriptors = getDesignAxisDescriptors(chartKind, bindings);
  const axes: Partial<Record<ChartDesignAxisId, AxisVisualConfig>> = {};
  for (const d of descriptors) {
    const isPrimary = d.id === "xPrimary" || d.id === "yPrimary";
    const baseAxis = createDefaultAxisVisual(isPrimary);
    axes[d.id] = deepMergeAxis(v.axes?.[d.id], baseAxis);
  }
  const visual: ChartVisualAppearance = {
    title: deepMergeTitle(v.title, defaults.title),
    plotMargin: deepMergePlotMargin(v.plotMargin, defaults.plotMargin),
    axes,
    dataPointLabels: deepMergeDataPointLabels(v.dataPointLabels, defaults.dataPointLabels),
  };
  return { ...appearance, visual };
}

/** Effective title string for display (follows chart name when `titleSource` is `"auto"`). */
export function resolveChartTitleDisplayText(visual: ChartVisualAppearance | undefined, chartName: string): string {
  if (!visual) return chartName.trim() || "Chart";
  if (visual.title.titleSource === "auto") {
    return chartName.trim() || visual.title.titleText || "Chart";
  }
  return visual.title.titleText || chartName.trim() || "Chart";
}

export function deriveAutoAxisLabel(
  axisId: ChartDesignAxisId,
  chartKind: ChartCreationKind,
  bindings: ChartBindingsState,
  catalog: Map<string, DataSeriesAssetRow>,
): string {
  const nameFor = (catalogName: string | null | undefined) =>
    catalogName ? (catalog.get(catalogName)?.name ?? catalogName) : "";

  if (bindings.mode === "indexed_layers") {
    const norm = normalizeIndexedAxesConfig(bindings.layers.length, bindings.indexedAxes);
    if (axisId === "xPrimary") {
      const n = bindings.layers[0]?.x;
      return n ? nameFor(n) : "X";
    }
    if (axisId === "yPrimary") {
      const n = bindings.layers[0]?.y;
      return n ? nameFor(n) : "Y";
    }
    if (axisId === "xSecondary") {
      let found: string | null = null;
      bindings.layers.forEach((row, i) => {
        if (norm.layerAssignments[i]?.x === "secondary" && row.x && !found) found = row.x;
      });
      return found ? nameFor(found) : "X Secondary";
    }
    if (axisId === "ySecondary") {
      let found: string | null = null;
      bindings.layers.forEach((row, i) => {
        if (norm.layerAssignments[i]?.y === "secondary" && row.y && !found) found = row.y;
      });
      return found ? nameFor(found) : "Y Secondary";
    }
  }
  if (bindings.mode === "category_values") {
    const horizontal = chartKind === "h_bar_cluster" || chartKind === "h_bar_stacked";
    if (!horizontal) {
      if (axisId === "xPrimary") {
        const c = bindings.category;
        return c ? nameFor(c) : "Category";
      }
      if (axisId === "yPrimary") {
        const v = bindings.values.find((x) => x != null);
        return v ? nameFor(v) : "Values";
      }
    } else {
      if (axisId === "xPrimary") {
        const v = bindings.values.find((x) => x != null);
        return v ? nameFor(v) : "Values";
      }
      if (axisId === "yPrimary") {
        const c = bindings.category;
        return c ? nameFor(c) : "Category";
      }
    }
  }
  if (bindings.mode === "paired") {
    if (axisId === "xPrimary") {
      const c = bindings.category;
      return c ? nameFor(c) : "Category";
    }
    if (axisId === "yPrimary") {
      const v = bindings.value;
      return v ? nameFor(v) : "Values";
    }
  }
  return "";
}

/**
 * Catalog series name whose `numeric_format` applies when `numericFormatOverride` is null.
 * Returns `null` for categorical axes (tick labels are not numeric series values).
 */
export function deriveAxisFormatSourceSeriesName(
  axisId: ChartDesignAxisId,
  chartKind: ChartCreationKind,
  bindings: ChartBindingsState,
): string | null {
  if (bindings.mode === "indexed_layers") {
    const norm = normalizeIndexedAxesConfig(bindings.layers.length, bindings.indexedAxes);
    if (axisId === "xPrimary") {
      const n = bindings.layers[0]?.x;
      return n?.trim() ? n : null;
    }
    if (axisId === "yPrimary") {
      const n = bindings.layers[0]?.y;
      return n?.trim() ? n : null;
    }
    if (axisId === "xSecondary") {
      for (let i = 0; i < bindings.layers.length; i++) {
        const row = bindings.layers[i]!;
        if (norm.layerAssignments[i]?.x === "secondary" && row.x) {
          const s = row.x.trim();
          if (s) return row.x;
        }
      }
      return null;
    }
    if (axisId === "ySecondary") {
      for (let i = 0; i < bindings.layers.length; i++) {
        const row = bindings.layers[i]!;
        if (norm.layerAssignments[i]?.y === "secondary" && row.y) {
          const s = row.y.trim();
          if (s) return row.y;
        }
      }
      return null;
    }
  }
  if (bindings.mode === "category_values") {
    const horizontal = chartKind === "h_bar_cluster" || chartKind === "h_bar_stacked";
    if (!horizontal) {
      if (axisId === "xPrimary") {
        return null;
      }
      if (axisId === "yPrimary") {
        const v = bindings.values.find((x) => x != null);
        return v?.trim() ? v : null;
      }
    } else {
      if (axisId === "xPrimary") {
        const v = bindings.values.find((x) => x != null);
        return v?.trim() ? v : null;
      }
      if (axisId === "yPrimary") {
        return null;
      }
    }
  }
  if (bindings.mode === "paired") {
    if (axisId === "xPrimary") {
      return null;
    }
    if (axisId === "yPrimary") {
      const v = bindings.value;
      return v?.trim() ? v : null;
    }
  }
  return null;
}

/** Resolves label for an axis for display (auto uses bound series names; user uses `labelText`). */
export function resolveAxisLabelDisplay(
  axisId: ChartDesignAxisId,
  visual: ChartVisualAppearance | undefined,
  chartKind: ChartCreationKind,
  bindings: ChartBindingsState,
  catalog: Map<string, DataSeriesAssetRow>,
): string {
  const axis = visual?.axes?.[axisId];
  if (!axis || axis.labelSource === "auto") {
    return deriveAutoAxisLabel(axisId, chartKind, bindings, catalog);
  }
  return axis.labelText || deriveAutoAxisLabel(axisId, chartKind, bindings, catalog);
}

/** Approximate height reserved for the title band in the design frame (px). */
export function estimateTitleBandPx(visual: ChartVisualAppearance): number {
  if (!visual.title.showTitle) return 0;
  const fs = Math.max(6, Math.min(128, visual.title.titleFontSizePt));
  return Math.ceil(8 + fs * 1.35);
}

/**
 * Combines user `plotMargin` with minimum space for optional secondary Cartesian axes (indexed charts).
 * Excel-style: outer chart object uses `plotMargin` to reserve space outside the Recharts plot.
 */
export function computeIndexedPlotMargin(
  secondaryX: boolean,
  secondaryY: boolean,
  plot: ChartPlotMargin,
): ChartPlotMargin {
  return {
    top: secondaryX ? Math.max(plot.top, 28) : plot.top,
    right: secondaryY ? Math.max(plot.right, 30) : plot.right,
    bottom: plot.bottom,
    left: plot.left,
  };
}

