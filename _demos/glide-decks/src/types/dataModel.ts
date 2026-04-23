/** Document-scoped data series & chart assets (see design/semantic-series-charting-spec.md). */

import type { ChartBindingsState } from "./chartBindings";

/** Wizard step 1 — how the user intends to define a new series (see semantic spec §8.2). */
export type SeriesCreationKind = "index" | "formula" | "manual";

/**
 * Wizard step 1 — chart type for a new global chart asset (see semantic spec §8.4).
 * Aligns with Stitch: Data Model · New Chart 60% Width (chart gallery).
 */
export type ChartCreationKind =
  | "v_bar_cluster"
  | "v_bar_stacked"
  | "h_bar_cluster"
  | "h_bar_stacked"
  | "line_1d"
  | "line_2d"
  | "scatter"
  | "bubble"
  | "pie"
  | "donut";

export type ValueType = "text" | "numeric" | "boolean" | "date" | string;

export type OriginKind = "imported" | "formula" | "manual" | string;

export type RoleKind = "none" | "index" | "mask" | string;

/** How distinct source labels are ordered for the index series rows (one row per unique label). */
export type IndexSortOrder = "ascending" | "descending" | "custom";

export interface DataSeriesAssetRow {
  name: string;
  value_type: ValueType;
  length: number;
  origin_kind: OriginKind;
  role_kind: RoleKind;
  /**
   * Freeform formula source for `origin_kind === "formula"` (not validated here).
   * Safe for arbitrary text until a query language exists.
   */
  raw_formula?: string;
  /** Optional note from sample fixtures (e.g. index derivation). */
  NOTE?: string;
  /**
   * For `role_kind === "index"`, the catalog name of the series this index was derived from
   * (stable when the index series is renamed away from e.g. `idx.*`).
   */
  index_source_series_name?: string;
  /** For index series — persisted sort used when materializing unique label rows from the source column. */
  index_sort_order?: IndexSortOrder;
  /** When `index_sort_order === "custom"` — user-defined label order (lines or comma-separated). */
  index_custom_order_text?: string;
  /**
   * Naming covenant: `"auto"` means the catalog/display name is not user-vetted — placeholders and
   * deterministic renames (e.g. `idx.*`, `fx.*`) may update until the user locks a name. `"user"` means
   * the user committed a name (grid rename / lock); avoid auto-overwriting.
   */
  series_display_name_source?: "auto" | "user";
  /**
   * Canonical numeric display format (`excel:…` / `python:…`) when set; see numeric-format-input-schema.
   * Formula series may seed this once from the `values` argument’s referenced series.
   */
  numeric_format?: string;
}

/** Stable ids for design-time axis styling (maps to Recharts xAxisId / yAxisId where applicable). */
export type ChartDesignAxisId = "xPrimary" | "xSecondary" | "yPrimary" | "ySecondary";

export interface ChartTitleVisualConfig {
  showTitle: boolean;
  titlePosition: "above_plot" | "below_plot";
  titleFontFamily: string;
  /** Typography size in points (6–128 in UI). */
  titleFontSizePt: number;
  titleText: string;
  /** When `"auto"`, display title tracks chart name until the user edits the title. */
  titleSource: "auto" | "user";
  titleOffsetXPx: number;
  titleOffsetYPx: number;
}

/**
 * Padding inside the chart object around the Recharts plot (Excel-style chart vs plot area).
 * Future: inner resize handles may adjust these margins to reserve space for title and labels outside the plot.
 */
export interface ChartPlotMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Excel-style major tick mark placement relative to the axis line. */
export type AxisTickMarkDisplay = "none" | "outside" | "inside" | "cross";

export interface AxisVisualConfig {
  showAxis: boolean;
  axisColor: string;
  axisThicknessPx: number;
  showLabel: boolean;
  labelText: string;
  labelSource: "auto" | "user";
  labelAngleDeg: number;
  labelFontFamily: string;
  labelFontSizePt: number;
  /** Default `cross` — symmetric through the axis (Excel major tick “cross”). */
  tickMarkDisplay: AxisTickMarkDisplay;
  /** When false, tick value labels are hidden (tick marks may still show). */
  showTickLabels: boolean;
  /** Canonical `excel:…` / `python:…`; `null` inherits from the bound series for this axis. */
  numericFormatOverride: string | null;
}

/** Data point labels (indexed charts: label slot on each layer). */
export interface ChartDataPointLabelsConfig {
  /** Default false — no labels on points until enabled. */
  show: boolean;
  fontFamily: string;
  /** Typography size in points (6–128 in UI). */
  fontSizePt: number;
}

export interface ChartVisualAppearance {
  title: ChartTitleVisualConfig;
  plotMargin: ChartPlotMargin;
  axes: Partial<Record<ChartDesignAxisId, AxisVisualConfig>>;
  dataPointLabels: ChartDataPointLabelsConfig;
}

/**
 * Layout of the chart frame on the design canvas (chart design appearance modal).
 * Position is relative to the modal canvas viewport (top-left).
 */
export interface ChartAppearanceLayout {
  widthPx: number;
  heightPx: number;
  offsetX: number;
  offsetY: number;
  /** widthPx / heightPx — stored for display and round-trip consistency. */
  aspectRatio: number;
  /** Title, plot margins, and per-axis styling. Omitted in legacy saved rows — merged at load. */
  visual?: ChartVisualAppearance;
}

export interface ChartAssetRow {
  /** Stable UUID — referenced by slide chart placements (`ChartPlacementSpec.chart_id`). */
  id: string;
  name: string;
  chart_type: string;
  live_instance_count: number;
  /** Present when saved from the authoring binding panel; used when reopening from the ledger. */
  bindings?: ChartBindingsState;
  /** User-authored frame layout from the design appearance modal. */
  appearance?: ChartAppearanceLayout;
}

/** Data source asset row (see semantic spec §4.1, §4.6). */
export type DataSourceProvenanceKind = "flat_file" | "external_sql";

export interface DataSourceRow {
  id: string;
  display_name: string;
  provenance_kind: DataSourceProvenanceKind;
  file_format?: "csv" | "xlsx";
  file_display_name?: string;
  sheet_name?: string;
  connection_label?: string;
  query_label?: string;
  row_count: number;
  field_count: number;
  estimated_memory_kb: number;
}
