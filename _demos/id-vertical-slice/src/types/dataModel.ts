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

export interface DataSeriesAssetRow {
  name: string;
  value_type: ValueType;
  length: number;
  origin_kind: OriginKind;
  role_kind: RoleKind;
  /** Optional note from sample fixtures (e.g. index derivation). */
  NOTE?: string;
}

export interface ChartAssetRow {
  name: string;
  chart_type: string;
  live_instance_count: number;
  /** Present when saved from the authoring binding panel; used when reopening from the ledger. */
  bindings?: ChartBindingsState;
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
