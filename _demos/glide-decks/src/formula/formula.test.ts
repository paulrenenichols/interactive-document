import { describe, expect, it } from "vitest";
import type { SeriesSemanticMeta } from "./contracts";
import { evaluateFormula, type FormulaEvalContext, type SeriesRuntime } from "./evaluateFormula";
import { parseFormula } from "./parseFormula";
import { validateFormula, type FormulaValidationContext } from "./validateFormula";

function meta(p: Partial<SeriesSemanticMeta> & Pick<SeriesSemanticMeta, "name" | "grainKind" | "valueType">): SeriesSemanticMeta {
  return {
    name: p.name,
    grainKind: p.grainKind,
    valueType: p.valueType,
    id: p.id,
    rootDatasetImportId: p.rootDatasetImportId ?? "ds1",
    alignedIndexId: p.alignedIndexId,
    indexSourceSeriesId: p.indexSourceSeriesId,
    indexSourceSeriesName: p.indexSourceSeriesName,
    roleKind: p.roleKind,
  };
}

describe("parseFormula", () => {
  it("strips optional leading =", () => {
    const r = parseFormula("=MEDIAN_BY([Base Salary], [idx.Job Family])");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.normalizedSource).toBe("MEDIAN_BY([Base Salary], [idx.Job Family])");
    expect(r.ast.kind).toBe("call");
  });

  it("parses kwarg where=", () => {
    const r = parseFormula(`MEDIAN_BY([a], [b], where=[m] = 1)`);
    expect(r.ok).toBe(true);
  });

  it("parses string concat", () => {
    const r = parseFormula(`"FY" & [x]`);
    expect(r.ok).toBe(true);
  });
});

describe("validateFormula", () => {
  it("rejects where= with index-grain", () => {
    const ctx: FormulaValidationContext = {
      seriesByName: new Map([
        ["Base Salary", meta({ name: "Base Salary", grainKind: "row", valueType: "numeric" })],
        [
          "idx.Job Family",
          meta({
            name: "idx.Job Family",
            grainKind: "index",
            valueType: "text",
            roleKind: "index",
            alignedIndexId: "idx1",
            indexSourceSeriesName: "Job Family",
          }),
        ],
        [
          "Count by Job Family",
          meta({
            name: "Count by Job Family",
            grainKind: "index",
            valueType: "numeric",
            alignedIndexId: "idx1",
          }),
        ],
      ]),
    };
    const v = validateFormula(
      `MEDIAN_BY([Base Salary], [idx.Job Family], where=[Count by Job Family] > 20)`,
      ctx,
    );
    expect(v.diagnostics.some((d) => d.code === "where_grain")).toBe(true);
  });

  it("passes simple MEDIAN_BY when series exist", () => {
    const ctx: FormulaValidationContext = {
      seriesByName: new Map([
        ["Base Salary", meta({ name: "Base Salary", grainKind: "row", valueType: "numeric" })],
        [
          "idx.Job Family",
          meta({
            name: "idx.Job Family",
            grainKind: "index",
            valueType: "text",
            roleKind: "index",
            alignedIndexId: "idx1",
            indexSourceSeriesName: "Job Family",
          }),
        ],
      ]),
    };
    const v = validateFormula(`MEDIAN_BY([Base Salary], [idx.Job Family])`, ctx);
    expect(v.diagnostics.filter((d) => d.severity === "error").length).toBe(0);
  });
});

describe("evaluateFormula", () => {
  it("computes MEDIAN_BY", () => {
    const rowCount = 4;
    const seriesByName = new Map<string, SeriesRuntime>([
      [
        "Job Family",
        {
          meta: meta({ name: "Job Family", grainKind: "row", valueType: "text" }),
          values: ["A", "A", "B", "B"],
        },
      ],
      [
        "Base Salary",
        {
          meta: meta({ name: "Base Salary", grainKind: "row", valueType: "numeric" }),
          values: [10, 30, 100, 200],
        },
      ],
      [
        "idx.Job Family",
        {
          meta: meta({
            name: "idx.Job Family",
            grainKind: "index",
            valueType: "text",
            roleKind: "index",
            alignedIndexId: "idx1",
            indexSourceSeriesName: "Job Family",
          }),
          values: ["A", "B"],
        },
      ],
    ]);

    const ctx: FormulaEvalContext = { seriesByName, rowCount };
    const r = evaluateFormula(`MEDIAN_BY([Base Salary], [idx.Job Family])`, ctx);
    expect("error" in r).toBe(false);
    if ("error" in r) return;
    expect(r.kind).toBe("index");
    if (r.kind !== "index") return;
    expect(r.values[0]).toBe(20);
    expect(r.values[1]).toBe(150);
  });

  it("computes SUM", () => {
    const seriesByName = new Map<string, SeriesRuntime>([
      [
        "x",
        {
          meta: meta({ name: "x", grainKind: "row", valueType: "numeric" }),
          values: [1, 2, null, 4],
        },
      ],
    ]);
    const r = evaluateFormula(`SUM([x])`, { seriesByName, rowCount: 4 });
    expect("error" in r).toBe(false);
    if ("error" in r) return;
    expect(r.kind).toBe("scalar");
    if (r.kind !== "scalar") return;
    expect(r.value).toBe(7);
  });
});
