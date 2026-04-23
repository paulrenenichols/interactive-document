import { CHART_PREVIEW_MAX_POINT_LABELS, CHART_PREVIEW_MAX_SERIES_LENGTH } from "./chartLimits";
import { normalizeIndexedAxesConfig, toRechartsAxisIds } from "./indexedAxesBindings";
import { createFixtureSeriesValueResolver, type SeriesValueResolver } from "../data/seriesValueResolver";
import { uniformLinearSample } from "../math/uniformLinearSample";
import type { ChartCreationKind } from "../types/dataModel";
import type { ChartBindingsState } from "../types/chartBindings";
import type { DataSeriesAssetRow } from "../types/dataModel";

const fixtureResolver = createFixtureSeriesValueResolver();

export function catalogByName(rows: DataSeriesAssetRow[]): Map<string, DataSeriesAssetRow> {
  const m = new Map<string, DataSeriesAssetRow>();
  for (const r of rows) {
    m.set(r.name, r);
  }
  return m;
}

function isNumericSeries(row: DataSeriesAssetRow): boolean {
  return row.value_type.toLowerCase() === "numeric";
}

/** Parsed numeric column; null if name missing, row missing, or not a numeric series. */
export function getNumericColumn(
  name: string | null,
  catalog: Map<string, DataSeriesAssetRow>,
  resolveValues: SeriesValueResolver = fixtureResolver,
): number[] | null {
  if (!name) return null;
  const row = catalog.get(name);
  if (!row || !isNumericSeries(row)) return null;
  const seeds = resolveValues(row);
  return seeds.map((s) => {
    const n = parseFloat(s);
    return Number.isNaN(n) ? 0 : n;
  });
}

function getStringColumn(
  name: string | null,
  catalog: Map<string, DataSeriesAssetRow>,
  resolveValues: SeriesValueResolver,
): string[] | null {
  if (!name) return null;
  const row = catalog.get(name);
  if (!row) return null;
  return resolveValues(row);
}

function minLen(arrays: (number[] | null)[]): number {
  const lens = arrays.filter((a): a is number[] => a != null && a.length > 0).map((a) => a.length);
  if (lens.length === 0) return 0;
  return Math.min(...lens);
}

/** Min length across numeric and/or string columns (aligned series). */
function minLenArrays(arrays: Array<number[] | string[] | null | undefined>): number {
  const lens = arrays.filter((a): a is number[] | string[] => a != null && a.length > 0).map((a) => a.length);
  if (lens.length === 0) return 0;
  return Math.min(...lens);
}

/**
 * Returns trimmed label text for rendering, or null if missing / empty / whitespace-only.
 * Such values must not produce DOM labels.
 */
export function sanitizePointLabelForRender(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const t = raw.trim();
  if (t.length === 0) return null;
  return t;
}

type PointWithRawLabel = { x: number; y: number; z?: number; rawLabel?: string | null };

/** Caps preview series length using uniform linear sampling (preserves index order). */
function downsamplePreviewSeries<T>(items: readonly T[]): T[] {
  if (items.length <= CHART_PREVIEW_MAX_SERIES_LENGTH) return [...items];
  return uniformLinearSample(items, CHART_PREVIEW_MAX_SERIES_LENGTH);
}

export type IndexedLayerPoint = { x: number; y: number; z?: number; label?: string };

export interface IndexedLayersPreviewData {
  chartKind: "scatter" | "line_2d" | "bubble";
  layers: { points: IndexedLayerPoint[]; xAxisId: string; yAxisId: string }[];
  secondaryX: boolean;
  secondaryY: boolean;
  /** True if more non-empty labels existed after applying {@link CHART_PREVIEW_MAX_POINT_LABELS}. */
  pointLabelsTruncated: boolean;
}

function applyChartWidePointLabelCap(
  layers: Array<{ points: PointWithRawLabel[]; xAxisId: string; yAxisId: string }>,
): { layers: IndexedLayersPreviewData["layers"]; pointLabelsTruncated: boolean } {
  let budget = CHART_PREVIEW_MAX_POINT_LABELS;
  let truncated = false;
  const out: IndexedLayersPreviewData["layers"] = [];
  for (const layer of layers) {
    const pts: IndexedLayerPoint[] = [];
    for (const p of layer.points) {
      const t = sanitizePointLabelForRender(p.rawLabel);
      const base: IndexedLayerPoint =
        p.z !== undefined ? { x: p.x, y: p.y, z: p.z } : { x: p.x, y: p.y };
      if (!t) {
        pts.push(base);
        continue;
      }
      if (budget > 0) {
        pts.push({ ...base, label: t });
        budget--;
      } else {
        truncated = true;
        pts.push(base);
      }
    }
    out.push({ points: pts, xAxisId: layer.xAxisId, yAxisId: layer.yAxisId });
  }
  return { layers: out, pointLabelsTruncated: truncated };
}

export interface CategoryValuesPreviewData {
  chartKind: ChartCreationKind;
  /** Row keys: `cat` for category label, `v0`..`v{n}` for numeric value columns */
  rows: Record<string, string | number>[];
  valueKeys: string[];
  stacked: boolean;
  horizontal: boolean;
}

export interface PairedPreviewData {
  slices: { name: string; value: number }[];
  donut: boolean;
}

export type ChartPreviewPayload =
  | { type: "indexed"; data: IndexedLayersPreviewData }
  | { type: "category_values"; data: CategoryValuesPreviewData }
  | { type: "paired"; data: PairedPreviewData };

function layerHasScatterLine2d(
  row: Record<string, string | null>,
  catalog: Map<string, DataSeriesAssetRow>,
  resolveValues: SeriesValueResolver,
): boolean {
  const x = getNumericColumn(row.x ?? null, catalog, resolveValues);
  const y = getNumericColumn(row.y ?? null, catalog, resolveValues);
  return x != null && y != null && x.length > 0 && y.length > 0;
}

function layerHasBubble(
  row: Record<string, string | null>,
  catalog: Map<string, DataSeriesAssetRow>,
  resolveValues: SeriesValueResolver,
): boolean {
  const x = getNumericColumn(row.x ?? null, catalog, resolveValues);
  const y = getNumericColumn(row.y ?? null, catalog, resolveValues);
  const z = getNumericColumn(row.size ?? null, catalog, resolveValues);
  return x != null && y != null && z != null && x.length > 0 && y.length > 0 && z.length > 0;
}

export function previewReadiness(
  chartKind: ChartCreationKind,
  bindings: ChartBindingsState,
  catalog: Map<string, DataSeriesAssetRow>,
  resolveValues: SeriesValueResolver = fixtureResolver,
): boolean {
  if (bindings.mode === "indexed_layers") {
    if (chartKind === "bubble") {
      return bindings.layers.some((row) => layerHasBubble(row, catalog, resolveValues));
    }
    if (chartKind === "scatter" || chartKind === "line_2d") {
      return bindings.layers.some((row) => layerHasScatterLine2d(row, catalog, resolveValues));
    }
    return false;
  }

  if (bindings.mode === "category_values") {
    const hasNumericValue = bindings.values.some((name) => {
      if (!name) return false;
      return getNumericColumn(name, catalog, resolveValues) != null;
    });
    if (!hasNumericValue) return false;
    if (chartKind === "line_1d") {
      return true;
    }
    return bindings.category != null && getStringColumn(bindings.category, catalog, resolveValues) != null;
  }

  if (bindings.mode === "paired") {
    if (!bindings.category || !bindings.value) return false;
    return (
      getNumericColumn(bindings.value, catalog, resolveValues) != null &&
      getStringColumn(bindings.category, catalog, resolveValues) != null
    );
  }

  return false;
}

function buildIndexedLayersData(
  chartKind: "scatter" | "line_2d" | "bubble",
  bindings: Extract<ChartBindingsState, { mode: "indexed_layers" }>,
  catalog: Map<string, DataSeriesAssetRow>,
  resolveValues: SeriesValueResolver,
): IndexedLayersPreviewData | null {
  const axes = normalizeIndexedAxesConfig(bindings.layers.length, bindings.indexedAxes);
  const layersBuild: Array<{ points: PointWithRawLabel[]; xAxisId: string; yAxisId: string }> = [];

  for (let li = 0; li < bindings.layers.length; li++) {
    const row = bindings.layers[li];
    const { xAxisId, yAxisId } = toRechartsAxisIds(
      axes.layerAssignments[li],
      axes.secondaryX,
      axes.secondaryY,
    );
    if (chartKind === "bubble") {
      if (!layerHasBubble(row, catalog, resolveValues)) continue;
      const xs = getNumericColumn(row.x ?? null, catalog, resolveValues)!;
      const ys = getNumericColumn(row.y ?? null, catalog, resolveValues)!;
      const zs = getNumericColumn(row.size ?? null, catalog, resolveValues)!;
      const labels = row.label ? getStringColumn(row.label, catalog, resolveValues) : null;
      const n = labels ? minLenArrays([xs, ys, zs, labels]) : minLen([xs, ys, zs]);
      const points: PointWithRawLabel[] = [];
      for (let i = 0; i < n; i++) {
        points.push({
          x: xs[i],
          y: ys[i],
          z: zs[i],
          rawLabel: labels ? labels[i] : undefined,
        });
      }
      layersBuild.push({ points: downsamplePreviewSeries(points), xAxisId, yAxisId });
    } else {
      if (!layerHasScatterLine2d(row, catalog, resolveValues)) continue;
      const xs = getNumericColumn(row.x ?? null, catalog, resolveValues)!;
      const ys = getNumericColumn(row.y ?? null, catalog, resolveValues)!;
      const labels = row.label ? getStringColumn(row.label, catalog, resolveValues) : null;
      const n = labels ? minLenArrays([xs, ys, labels]) : minLen([xs, ys]);
      const points: PointWithRawLabel[] = [];
      for (let i = 0; i < n; i++) {
        points.push({ x: xs[i], y: ys[i], rawLabel: labels ? labels[i] : undefined });
      }
      layersBuild.push({ points: downsamplePreviewSeries(points), xAxisId, yAxisId });
    }
  }

  if (layersBuild.length === 0) return null;
  const { layers, pointLabelsTruncated } = applyChartWidePointLabelCap(layersBuild);
  return { chartKind, layers, secondaryX: axes.secondaryX, secondaryY: axes.secondaryY, pointLabelsTruncated };
}

function buildCategoryValuesData(
  chartKind: ChartCreationKind,
  bindings: Extract<ChartBindingsState, { mode: "category_values" }>,
  catalog: Map<string, DataSeriesAssetRow>,
  resolveValues: SeriesValueResolver,
): CategoryValuesPreviewData | null {
  const valueNames = bindings.values.filter(
    (v): v is string => v != null && getNumericColumn(v, catalog, resolveValues) != null,
  );
  if (valueNames.length === 0) return null;

  const valueCols = valueNames.map((name) => getNumericColumn(name, catalog, resolveValues)!);
  let cat: string[];
  if (bindings.category) {
    const s = getStringColumn(bindings.category, catalog, resolveValues);
    if (!s) return null;
    cat = s;
  } else {
    const n = minLen(valueCols);
    cat = Array.from({ length: n }, (_, i) => String(i + 1));
  }

  const n = Math.min(cat.length, minLen(valueCols));
  if (n === 0) return null;

  const valueKeys = valueNames.map((_, i) => `v${i}`);
  const rows: Record<string, string | number>[] = [];
  for (let i = 0; i < n; i++) {
    const rec: Record<string, string | number> = { cat: cat[i] };
    valueNames.forEach((_, j) => {
      rec[`v${j}`] = valueCols[j][i];
    });
    rows.push(rec);
  }

  const rowsDown = downsamplePreviewSeries(rows);

  const stacked =
    chartKind === "v_bar_stacked" || chartKind === "h_bar_stacked";
  const horizontal =
    chartKind === "h_bar_cluster" || chartKind === "h_bar_stacked";

  return {
    chartKind,
    rows: rowsDown,
    valueKeys,
    stacked,
    horizontal,
  };
}

function buildPairedData(
  bindings: Extract<ChartBindingsState, { mode: "paired" }>,
  catalog: Map<string, DataSeriesAssetRow>,
  resolveValues: SeriesValueResolver,
  donut: boolean,
): PairedPreviewData | null {
  const cats = getStringColumn(bindings.category, catalog, resolveValues);
  const vals = getNumericColumn(bindings.value, catalog, resolveValues);
  if (!cats || !vals) return null;
  const n = Math.min(cats.length, vals.length);
  const slices: { name: string; value: number }[] = [];
  for (let i = 0; i < n; i++) {
    slices.push({ name: String(cats[i]), value: vals[i] });
  }
  if (slices.length === 0) return null;
  return { slices: downsamplePreviewSeries(slices), donut };
}

/**
 * Builds preview payload for Recharts, or null if nothing to show.
 * Call only when `previewReadiness` is true (or rely on null return).
 */
export function buildChartPreviewPayload(
  chartKind: ChartCreationKind,
  bindings: ChartBindingsState,
  catalog: Map<string, DataSeriesAssetRow>,
  resolveValues: SeriesValueResolver = fixtureResolver,
): ChartPreviewPayload | null {
  if (bindings.mode === "indexed_layers") {
    if (chartKind === "bubble") {
      const data = buildIndexedLayersData("bubble", bindings, catalog, resolveValues);
      return data ? { type: "indexed", data } : null;
    }
    if (chartKind === "scatter" || chartKind === "line_2d") {
      const data = buildIndexedLayersData(chartKind, bindings, catalog, resolveValues);
      return data ? { type: "indexed", data } : null;
    }
    return null;
  }

  if (bindings.mode === "category_values") {
    const data = buildCategoryValuesData(chartKind, bindings, catalog, resolveValues);
    return data ? { type: "category_values", data } : null;
  }

  if (bindings.mode === "paired") {
    const data = buildPairedData(bindings, catalog, resolveValues, chartKind === "donut");
    return data ? { type: "paired", data } : null;
  }

  return null;
}
