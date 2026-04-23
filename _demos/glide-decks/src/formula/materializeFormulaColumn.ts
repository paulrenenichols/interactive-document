import { tryParseNumericCell } from "../data/csvColumnImport";
import type { DataSeriesAssetRow } from "../types/dataModel";
import type { FormulaValueType } from "./contracts";
import type { CellValue, FormulaEvalContext, FormulaResult, SeriesRuntime } from "./evaluateFormula";
import { evaluateFormula } from "./evaluateFormula";
import { validationContextFromSeriesRows } from "./buildValidationContext";
import { normalizeLeadingEquals } from "./contracts";

export type MaterializeFormulaColumnResult =
  | { ok: true; values: string[] }
  | { ok: false; error: string };

/**
 * Max row count for row-grain evaluation: imported / manual columns driving dataset height.
 * Excludes index columns (cardinality of labels, not row count) and the formula row being saved.
 * Other formula series are skipped here so their (possibly short) materialized columns do not
 * shrink `rowCount` below the main table height.
 */
export function datasetRowCountForFormulaEval(
  rows: readonly DataSeriesAssetRow[],
  getValuesForSeries: (name: string) => readonly string[],
  excludeSeriesName?: string,
): number {
  let max = 0;
  for (const r of rows) {
    if (excludeSeriesName !== undefined && r.name === excludeSeriesName) continue;
    if (r.role_kind === "index") continue;
    if (r.origin_kind === "formula") continue;
    const len = getValuesForSeries(r.name).length;
    if (len > max) max = len;
  }
  if (max === 0) {
    for (const r of rows) {
      if (excludeSeriesName !== undefined && r.name === excludeSeriesName) continue;
      if (r.role_kind === "index") continue;
      const len = getValuesForSeries(r.name).length;
      if (len > max) max = len;
    }
  }
  return max;
}

function parseCell(raw: string, valueType: FormulaValueType): CellValue {
  const s = raw.trim();
  if (s === "") return null;
  if (valueType === "numeric") {
    const n = tryParseNumericCell(s);
    return n;
  }
  if (valueType === "boolean") {
    const t = s.toLowerCase();
    if (t === "true" || t === "1") return true;
    if (t === "false" || t === "0") return false;
    return null;
  }
  return s;
}

function formatCellForStorage(v: CellValue): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "";
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

function formulaResultToStrings(r: FormulaResult, rowCount: number): string[] {
  if (r.kind === "scalar") {
    void rowCount;
    return [formatCellForStorage(r.value)];
  }
  if (r.kind === "row") return r.values.map(formatCellForStorage);
  if (r.kind === "index") return r.values.map(formatCellForStorage);
  return [];
}

function padRowValues(values: CellValue[], rowCount: number): CellValue[] {
  if (values.length >= rowCount) return values.slice(0, rowCount);
  const out = values.slice();
  while (out.length < rowCount) out.push(null);
  return out;
}

/**
 * Evaluates `rawFormula` against the current catalog and cell strings, returning persisted cell values
 * for a formula series (row- or index-shaped).
 */
export function materializeFormulaColumn(args: {
  rows: readonly DataSeriesAssetRow[];
  getValuesForSeries: (name: string) => readonly string[];
  rawFormula: string;
  /** Omit this catalog series from the eval context (the row being materialized). */
  excludeSeriesName?: string;
}): MaterializeFormulaColumnResult {
  const trimmed = normalizeLeadingEquals(args.rawFormula).trim();
  if (!trimmed) return { ok: false, error: "Formula is empty." };

  const rowCount = datasetRowCountForFormulaEval(
    args.rows,
    args.getValuesForSeries,
    args.excludeSeriesName,
  );
  if (rowCount === 0) return { ok: false, error: "No row data available to evaluate the formula." };

  const validation = validationContextFromSeriesRows(args.rows);
  const seriesByName = new Map<string, SeriesRuntime>();

  for (const r of args.rows) {
    if (args.excludeSeriesName !== undefined && r.name === args.excludeSeriesName) continue;
    const meta = validation.seriesByName.get(r.name);
    if (!meta) continue;

    const rawStrings = args.getValuesForSeries(r.name);
    /** Index members are grouping keys; parse as text even if catalog `value_type` is wrong (e.g. legacy `numeric`). */
    const parseType: FormulaValueType =
      meta.grainKind === "index" ? "text" : meta.valueType;
    const parsed = rawStrings.map((s) => parseCell(s, parseType));

    let values: CellValue[];
    if (meta.grainKind === "index") {
      values = parsed;
    } else if (meta.grainKind === "row") {
      values = padRowValues(parsed, rowCount);
    } else {
      values = parsed.length > 0 ? [parseCell(rawStrings[0] ?? "", meta.valueType)] : [null];
    }

    seriesByName.set(r.name, { meta, values });
  }

  const ctx: FormulaEvalContext = { seriesByName, rowCount };
  const out = evaluateFormula(trimmed, ctx);
  if ("error" in out) return { ok: false, error: out.error };
  return { ok: true, values: formulaResultToStrings(out, rowCount) };
}
