import type {
  ChartAssetRow,
  ChartCreationKind,
  DataSeriesAssetRow,
  DataSourceRow,
} from "../types/dataModel";

/** Short UI label for the chart wizard / binding panel (matches CreateChartStepSelect titles). */
export const CHART_CREATION_KIND_LABEL: Record<ChartCreationKind, string> = {
  v_bar_cluster: "V Bar Cluster",
  v_bar_stacked: "V Bar Stacked",
  h_bar_cluster: "H Bar Cluster",
  h_bar_stacked: "H Bar Stacked",
  line_1d: "1D Line",
  line_2d: "2D Line",
  scatter: "Scatter",
  bubble: "Bubble",
  pie: "Pie",
  donut: "Donut",
};

/** Default name prefix for auto-generated chart titles (e.g. "Bubble Chart 01"). */
export const CHART_KIND_NAME_PREFIX: Record<ChartCreationKind, string> = {
  bubble: "Bubble Chart",
  scatter: "Scatter Chart",
  line_2d: "2D Line Chart",
  v_bar_cluster: "V Bar Cluster Chart",
  v_bar_stacked: "V Bar Stacked Chart",
  h_bar_cluster: "H Bar Cluster Chart",
  h_bar_stacked: "H Bar Stacked Chart",
  line_1d: "1D Line Chart",
  pie: "Pie Chart",
  donut: "Donut Chart",
};

/**
 * Ledger `chart_type` strings aligned with sample-chart-array.json and inferChartCreationKindFromChartType.
 */
export function chartCreationKindToLedgerType(kind: ChartCreationKind): string {
  const map: Record<ChartCreationKind, string> = {
    bubble: "bubble",
    scatter: "scatter",
    line_2d: "2d line",
    v_bar_cluster: "vertical clustered bar",
    v_bar_stacked: "vertical stacked bar",
    h_bar_cluster: "horizontal clustered bar",
    h_bar_stacked: "horizontal stacked bar",
    line_1d: "line",
    pie: "pie",
    donut: "donut",
  };
  return map[kind];
}

export function collectTakenNames(params: {
  series: DataSeriesAssetRow[];
  dataSources: DataSourceRow[];
  charts: ChartAssetRow[];
}): Set<string> {
  const set = new Set<string>();
  for (const r of params.series) set.add(r.name);
  for (const r of params.dataSources) set.add(r.display_name);
  for (const r of params.charts) set.add(r.name);
  return set;
}

/** Next unused name like "Bubble Chart 01" … "99", then "Bubble Chart 100", … */
export function suggestUniqueChartName(kind: ChartCreationKind, taken: Set<string>): string {
  const prefix = CHART_KIND_NAME_PREFIX[kind];
  for (let n = 1; n <= 99; n++) {
    const candidate = `${prefix} ${String(n).padStart(2, "0")}`;
    if (!taken.has(candidate)) return candidate;
  }
  for (let n = 100; n <= 999; n++) {
    const candidate = `${prefix} ${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${prefix} ${Date.now()}`;
}
