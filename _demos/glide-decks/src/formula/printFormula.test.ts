import { describe, expect, it } from "vitest";
import { normalizeFormulaSource, outermostCallFunctionName, printFormulaAst } from "./printFormula";
import { parseFormula } from "./parseFormula";

describe("normalizeFormulaSource", () => {
  it("uppercases function names from user-typed lower case", () => {
    expect(normalizeFormulaSource("=median_by([Base Salary], [idx.Job Family])")).toBe(
      "MEDIAN_BY([Base Salary], [idx.Job Family])",
    );
  });

  it("preserves bracket series spelling", () => {
    expect(normalizeFormulaSource("sum([My Column])")).toBe("SUM([My Column])");
  });

  it("returns null on parse error", () => {
    expect(normalizeFormulaSource("SUM(")).toBeNull();
  });
});

describe("outermostCallFunctionName", () => {
  it("returns outer call fn", () => {
    const p = parseFormula("MEDIAN_BY([a], [b])");
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    expect(outermostCallFunctionName(p.ast)).toBe("MEDIAN_BY");
  });

  it("finds first call in binary tree", () => {
    const p = parseFormula(`1 + MEDIAN_BY([x], [y])`);
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    expect(outermostCallFunctionName(p.ast)).toBe("MEDIAN_BY");
  });
});

describe("printFormulaAst round-trip shape", () => {
  it("matches parse then print for nested call", () => {
    const src = `MEDIAN_BY([Base Salary], [idx], where=[c] > 1)`;
    const p = parseFormula(src);
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    expect(printFormulaAst(p.ast)).toBe(src);
  });
});
