import { describe, expect, it } from "vitest";
import type { DataSeriesAssetRow } from "../types/dataModel";
import {
  datasetRowCountForFormulaEval,
  materializeFormulaColumn,
} from "./materializeFormulaColumn";

function rowsMedianByFixture(): DataSeriesAssetRow[] {
  return [
    {
      name: "Job Family",
      value_type: "text",
      length: 4,
      origin_kind: "imported",
      role_kind: "none",
    },
    {
      name: "Base Salary",
      value_type: "numeric",
      length: 4,
      origin_kind: "imported",
      role_kind: "none",
    },
    {
      name: "idx.Job Family",
      value_type: "text",
      length: 2,
      origin_kind: "index",
      role_kind: "index",
      index_source_series_name: "Job Family",
    },
    {
      name: "New Formula 01",
      value_type: "numeric",
      length: 4,
      origin_kind: "formula",
      role_kind: "none",
      raw_formula: "",
    },
  ];
}

function valuesMedianByFixture(): Map<string, string[]> {
  return new Map([
    ["Job Family", ["A", "A", "B", "B"]],
    ["Base Salary", ["10", "30", "100", "200"]],
    ["idx.Job Family", ["A", "B"]],
    ["New Formula 01", ["", "", "", ""]],
  ]);
}

describe("datasetRowCountForFormulaEval", () => {
  it("uses imported row height, not index cardinality", () => {
    const rows: DataSeriesAssetRow[] = [
      { name: "x", value_type: "numeric", length: 796, origin_kind: "imported", role_kind: "none" },
      { name: "idx", value_type: "text", length: 19, origin_kind: "index", role_kind: "index" },
    ];
    const vals = new Map<string, string[]>([
      ["x", Array.from({ length: 796 }, () => "1")],
      ["idx", Array.from({ length: 19 }, () => "k")],
    ]);
    const n = datasetRowCountForFormulaEval(rows, (name) => vals.get(name) ?? []);
    expect(n).toBe(796);
  });
});

describe("materializeFormulaColumn", () => {
  it("materializes MEDIAN_BY to index-shaped strings", () => {
    const rows = rowsMedianByFixture();
    const vals = valuesMedianByFixture();
    const r = materializeFormulaColumn({
      rows,
      getValuesForSeries: (name) => vals.get(name) ?? [],
      rawFormula: "MEDIAN_BY([Base Salary], [idx.Job Family])",
      excludeSeriesName: "New Formula 01",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.values).toEqual(["20", "150"]);
  });

  it("materializes MEDIAN_BY when grouping text cells have leading/trailing whitespace (matches trimmed index keys)", () => {
    const rows = rowsMedianByFixture();
    const vals = new Map<string, string[]>([
      ["Job Family", ["  A  ", "A", "  B  ", "B"]],
      ["Base Salary", ["10", "30", "100", "200"]],
      ["idx.Job Family", ["A", "B"]],
      ["New Formula 01", ["", "", "", ""]],
    ]);
    const r = materializeFormulaColumn({
      rows,
      getValuesForSeries: (name) => vals.get(name) ?? [],
      rawFormula: "MEDIAN_BY([Base Salary], [idx.Job Family])",
      excludeSeriesName: "New Formula 01",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.values).toEqual(["20", "150"]);
  });

  it("materializes MEDIAN_BY when index catalog row is wrongly typed numeric (string labels)", () => {
    const rows: DataSeriesAssetRow[] = [
      {
        name: "Job Family",
        value_type: "text",
        length: 4,
        origin_kind: "imported",
        role_kind: "none",
      },
      {
        name: "Base Salary",
        value_type: "numeric",
        length: 4,
        origin_kind: "imported",
        role_kind: "none",
      },
      {
        name: "idx.Job Family",
        value_type: "numeric",
        length: 2,
        origin_kind: "index",
        role_kind: "index",
        index_source_series_name: "Job Family",
      },
      {
        name: "New Formula 01",
        value_type: "numeric",
        length: 4,
        origin_kind: "formula",
        role_kind: "none",
        raw_formula: "",
      },
    ];
    const vals = valuesMedianByFixture();
    const r = materializeFormulaColumn({
      rows,
      getValuesForSeries: (name) => vals.get(name) ?? [],
      rawFormula: "MEDIAN_BY([Base Salary], [idx.Job Family])",
      excludeSeriesName: "New Formula 01",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.values).toEqual(["20", "150"]);
  });

  it("returns error when formula is empty", () => {
    const r = materializeFormulaColumn({
      rows: rowsMedianByFixture(),
      getValuesForSeries: () => [],
      rawFormula: "   ",
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatch(/empty/i);
  });

  it("parses comma-formatted numeric cells like CSV import", () => {
    const rows = rowsMedianByFixture();
    const vals = new Map<string, string[]>([
      ["Job Family", ["A", "A"]],
      ["Base Salary", ["493,000", "484,000"]],
      ["idx.Job Family", ["A"]],
      ["New Formula 01", [""]],
    ]);
    const r = materializeFormulaColumn({
      rows,
      getValuesForSeries: (name) => vals.get(name) ?? [],
      rawFormula: "MEDIAN_BY([Base Salary], [idx.Job Family])",
      excludeSeriesName: "New Formula 01",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.values).toEqual(["488500"]);
  });
});
