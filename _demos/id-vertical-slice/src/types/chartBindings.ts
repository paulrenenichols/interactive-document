/** Drag payload for attaching global data series to chart slots (HTML5 DnD). */
export const DATA_SERIES_DRAG_MIME = "application/x-id-data-series";

/** Drag payload for chart assets onto workspace canvas (HTML5 DnD). */
export const CHART_ASSET_DRAG_MIME = "application/x-id-chart";

export type ChartBindingMode = "indexed_layers" | "category_values" | "paired";

/** One point layer: slot id → bound series name (semantic spec §7 — index-aligned tuples). */
export type IndexedLayerRow = Record<string, string | null>;

export type ChartBindingsState =
  | { mode: "indexed_layers"; layers: IndexedLayerRow[] }
  | { mode: "category_values"; category: string | null; values: (string | null)[] }
  | { mode: "paired"; category: string | null; value: string | null };

export function readSeriesNameFromDataTransfer(dt: DataTransfer): string | null {
  const v = dt.getData(DATA_SERIES_DRAG_MIME);
  return v.trim() ? v.trim() : null;
}

export function readChartNameFromDataTransfer(dt: DataTransfer): string | null {
  const v = dt.getData(CHART_ASSET_DRAG_MIME);
  return v.trim() ? v.trim() : null;
}
