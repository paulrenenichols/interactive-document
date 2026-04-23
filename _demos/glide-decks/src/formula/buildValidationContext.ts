import type { DataSeriesAssetRow } from "../types/dataModel";
import type { FormulaValidationContext, SeriesSemanticMeta } from "./contracts";

function mapValueType(vt: string): SeriesSemanticMeta["valueType"] {
  const v = vt.toLowerCase();
  if (v === "numeric") return "numeric";
  if (v === "boolean") return "boolean";
  if (v === "date") return "date";
  return "text";
}

/**
 * Best-effort {@link FormulaValidationContext} from grid/catalog rows until
 * persistence exposes full lineage and alignment IDs.
 */
export function validationContextFromSeriesRows(
  rows: readonly DataSeriesAssetRow[],
  datasetLineageId = "document",
): FormulaValidationContext {
  const seriesByName = new Map<string, SeriesSemanticMeta>();
  for (const r of rows) {
    const grain: SeriesSemanticMeta["grainKind"] =
      r.role_kind === "index" ? "index" : r.length <= 1 ? "scalar" : "row";
    seriesByName.set(r.name, {
      name: r.name,
      valueType: mapValueType(r.value_type),
      grainKind: grain,
      rootDatasetImportId: datasetLineageId,
      alignedIndexId: r.role_kind === "index" ? `idx:${r.name}` : undefined,
      indexSourceSeriesName: r.index_source_series_name ?? null,
      roleKind: r.role_kind,
    });
  }
  return { seriesByName };
}
