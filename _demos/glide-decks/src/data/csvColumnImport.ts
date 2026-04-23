import Papa from "papaparse";
import type { DataSeriesAssetRow, ValueType } from "../types/dataModel";

export const DEFAULT_AUTHORING_CSV_URL = "/input-data-files/hris-acme-technologies.csv";

function stripCommas(s: string): string {
  return s.replace(/,/g, "").trim();
}

/** True if the cell can be interpreted as a finite number (currency, plain, percent like "12%"). */
export function tryParseNumericCell(raw: string | undefined): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (s === "" || s === "-") return null;
  const pct = s.match(/^(-?[\d.]+)\s*%$/);
  if (pct) {
    const n = Number(pct[1]);
    return Number.isFinite(n) ? n : null;
  }
  const cleaned = stripCommas(s);
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function classifyColumnValues(values: string[]): ValueType {
  const nonEmpty = values.filter((v) => v.trim() !== "");
  if (nonEmpty.length === 0) return "text";
  for (const v of nonEmpty) {
    if (tryParseNumericCell(v) == null) return "text";
  }
  return "numeric";
}

export interface CsvColumnImportResult {
  fileDisplayName: string;
  rowCount: number;
  /** One entry per CSV column (header order). */
  series: DataSeriesAssetRow[];
  /** Raw cell strings per series name (aligned row indices). */
  valuesBySeriesName: Map<string, string[]>;
  fieldCount: number;
}

function fileNameFromUrl(url: string): string {
  try {
    const u = new URL(url, "http://local.invalid");
    const seg = u.pathname.split("/").filter(Boolean);
    return seg[seg.length - 1] ?? url;
  } catch {
    const seg = url.split(/[/\\]/).filter(Boolean);
    return seg[seg.length - 1] ?? url;
  }
}

/**
 * Fetches a CSV and builds imported data series (one per column) with numeric/text classification.
 */
export async function importCsvColumnsAsSeries(
  url: string = DEFAULT_AUTHORING_CSV_URL,
): Promise<CsvColumnImportResult> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load CSV: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  const fileDisplayName = fileNameFromUrl(url);

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length > 0) {
    const fatal = parsed.errors.find((e) => e.type === "Quotes" || e.type === "FieldMismatch");
    if (fatal) {
      throw new Error(`CSV parse error: ${fatal.message}`);
    }
  }

  const data = (parsed.data ?? []).filter((row) =>
    Object.keys(row).some((k) => row[k]?.trim() !== ""),
  );
  const rowCount = data.length;
  const headers = parsed.meta.fields?.map((h) => h.trim()).filter((h) => h !== "") ?? [];

  if (headers.length === 0) {
    throw new Error("CSV has no headers.");
  }

  const valuesBySeriesName = new Map<string, string[]>();
  const series: DataSeriesAssetRow[] = [];

  for (const header of headers) {
    const col: string[] = [];
    for (let i = 0; i < rowCount; i++) {
      col.push(data[i][header] ?? "");
    }
    const valueType = classifyColumnValues(col);
    valuesBySeriesName.set(header, col);
    series.push({
      name: header,
      value_type: valueType,
      length: rowCount,
      origin_kind: "imported",
      role_kind: "none",
    });
  }

  return {
    fileDisplayName,
    rowCount,
    series,
    valuesBySeriesName,
    fieldCount: headers.length,
  };
}
