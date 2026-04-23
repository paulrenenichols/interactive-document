import type { ChartCreationKind } from "../types/dataModel";
import type { ChartBindingsState, ChartBindingMode, IndexedLayerRow } from "../types/chartBindings";

/** Default preview width ÷ height (4:3). Tune per chart kind in `CHART_CONTRACTS` if needed. */
export const DEFAULT_CHART_PREVIEW_ASPECT_RATIO = 4 / 3; // 4:3

export interface ChartSlotDef {
  id: string;
  label: string;
  description: string;
}

export interface ChartContract {
  mode: ChartBindingMode;
  slots: ChartSlotDef[];
  /** Group label for the numeric series list (bars / line). */
  valuesGroupLabel?: string;
  /** Width ÷ height for Recharts preview framing in the chart binding panel. */
  defaultAspectRatio: number;
}

/** Chart contracts — design/semantic-series-charting-spec.md §7. */
export const CHART_CONTRACTS: Record<ChartCreationKind, ChartContract> = {
  bubble: {
    defaultAspectRatio: DEFAULT_CHART_PREVIEW_ASPECT_RATIO,
    mode: "indexed_layers",
    slots: [
      { id: "x", label: "X-Axis position", description: "Numeric — horizontal distribution" },
      { id: "y", label: "Y-Axis position", description: "Numeric — vertical scale" },
      { id: "size", label: "Bubble size", description: "Numeric — z-axis magnitude" },
      { id: "label", label: "Categories (labels)", description: "Text / index — identity and grouping" },
    ],
  },
  scatter: {
    defaultAspectRatio: DEFAULT_CHART_PREVIEW_ASPECT_RATIO,
    mode: "indexed_layers",
    slots: [
      { id: "x", label: "X position", description: "Numeric — horizontal value" },
      { id: "y", label: "Y position", description: "Numeric — vertical value" },
      { id: "label", label: "Category / label", description: "Text / index — point identity" },
    ],
  },
  line_2d: {
    defaultAspectRatio: DEFAULT_CHART_PREVIEW_ASPECT_RATIO,
    mode: "indexed_layers",
    slots: [
      { id: "x", label: "X position", description: "Numeric or ordered domain" },
      { id: "y", label: "Y position", description: "Numeric — series value" },
      { id: "label", label: "Series / label", description: "Optional grouping or series id" },
    ],
  },
  v_bar_cluster: {
    defaultAspectRatio: DEFAULT_CHART_PREVIEW_ASPECT_RATIO,
    mode: "category_values",
    valuesGroupLabel: "Value series (clustered)",
    slots: [
      { id: "value", label: "Bar Values", description: "One or more numeric series aligned to category" },
      { id: "category", label: "Category axis", description: "Text / index — one category series" },
      
    ],
  },
  v_bar_stacked: {
    defaultAspectRatio: DEFAULT_CHART_PREVIEW_ASPECT_RATIO,
    mode: "category_values",
    valuesGroupLabel: "Stack segments",
    slots: [
      { id: "category", label: "Category axis", description: "Text / index — shared categories" },
      { id: "value", label: "Values", description: "Numeric series stacked in order" },
    ],
  },
  h_bar_cluster: {
    defaultAspectRatio: DEFAULT_CHART_PREVIEW_ASPECT_RATIO,
    mode: "category_values",
    valuesGroupLabel: "Value series (clustered)",
    slots: [
      { id: "category", label: "Category axis", description: "Text / index — row categories" },
      { id: "value", label: "Values", description: "Numeric series aligned to category" },
    ],
  },
  h_bar_stacked: {
    defaultAspectRatio: DEFAULT_CHART_PREVIEW_ASPECT_RATIO,
    mode: "category_values",
    valuesGroupLabel: "Stack segments",
    slots: [
      { id: "category", label: "Category axis", description: "Text / index" },
      { id: "value", label: "Values", description: "Numeric series — relative volume" },
    ],
  },
  line_1d: {
    defaultAspectRatio: DEFAULT_CHART_PREVIEW_ASPECT_RATIO,
    mode: "category_values",
    valuesGroupLabel: "Line series",
    slots: [
      { id: "category", label: "Category / index (optional)", description: "Ordered domain — optional" },
      { id: "value", label: "Values", description: "One or more numeric series on the same domain" },
    ],
  },
  pie: {
    defaultAspectRatio: DEFAULT_CHART_PREVIEW_ASPECT_RATIO,
    mode: "paired",
    slots: [
      { id: "category", label: "Categories", description: "Text / index — slice labels" },
      { id: "value", label: "Values", description: "Numeric — slice sizes" },
    ],
  },
  donut: {
    defaultAspectRatio: DEFAULT_CHART_PREVIEW_ASPECT_RATIO,
    mode: "paired",
    slots: [
      { id: "category", label: "Categories", description: "Text / index — segment labels" },
      { id: "value", label: "Values", description: "Numeric — ring magnitudes" },
    ],
  },
};

export function getChartContract(kind: ChartCreationKind): ChartContract {
  return CHART_CONTRACTS[kind];
}

/**
 * Maps fixture / ledger `chart_type` strings (e.g. "vertical stacked bar") to `ChartCreationKind`.
 */
export function inferChartCreationKindFromChartType(chartType: string): ChartCreationKind {
  const t = chartType.toLowerCase();
  if (t.includes("bubble")) return "bubble";
  if (t.includes("scatter")) return "scatter";
  if (t.includes("donut")) return "donut";
  if (t.includes("pie")) return "pie";
  if (t.includes("2d") || t.includes("2-d")) return "line_2d";
  if (t.includes("line")) return "line_1d";
  if (t.includes("horizontal")) {
    if (t.includes("stack")) return "h_bar_stacked";
    if (t.includes("cluster")) return "h_bar_cluster";
  }
  if (t.includes("vertical")) {
    if (t.includes("stack")) return "v_bar_stacked";
    if (t.includes("cluster")) return "v_bar_cluster";
  }
  return "v_bar_cluster";
}

export function createEmptyBindings(kind: ChartCreationKind): ChartBindingsState {
  const c = CHART_CONTRACTS[kind];
  if (c.mode === "indexed_layers") {
    const row: IndexedLayerRow = {};
    for (const s of c.slots) row[s.id] = null;
    return { mode: "indexed_layers", layers: [row] };
  }
  if (c.mode === "category_values") {
    return { mode: "category_values", category: null, values: [null] };
  }
  return { mode: "paired", category: null, value: null };
}
