import type { DataSeriesAssetRow } from "./dataModel";

export type AuthoringSchemaRecipeKind = "unique_index" | "stub";

export interface AuthoringDerivedSeriesDef {
  name: string;
  value_type: DataSeriesAssetRow["value_type"];
  origin_kind: DataSeriesAssetRow["origin_kind"];
  role_kind: DataSeriesAssetRow["role_kind"];
  /** CSV column headers this recipe reads from. */
  sourceColumns: string[];
  /** How to materialize values when applied; `stub` adds metadata only (length 0, no cells). */
  recipeKind?: AuthoringSchemaRecipeKind;
}

export interface AuthoringSchemaChartStub {
  name: string;
  chart_type: string;
  live_instance_count?: number;
}

export interface AuthoringSchemaFile {
  version: number;
  sourceFile?: string;
  derivedSeries: AuthoringDerivedSeriesDef[];
  charts?: AuthoringSchemaChartStub[];
}
