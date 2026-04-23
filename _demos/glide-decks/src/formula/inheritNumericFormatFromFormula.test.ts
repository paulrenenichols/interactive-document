import { describe, expect, it } from "vitest";
import type { DataSeriesAssetRow } from "../types/dataModel";
import { inheritNumericFormatFromFormula } from "./inheritNumericFormatFromFormula";

function row(partial: Partial<DataSeriesAssetRow> & Pick<DataSeriesAssetRow, "name">): DataSeriesAssetRow {
  return {
    value_type: "numeric",
    length: 1,
    origin_kind: "imported",
    role_kind: "none",
    ...partial,
  };
}

describe("inheritNumericFormatFromFormula", () => {
  it("returns parent numeric_format for MEDIAN_BY value series", () => {
    const catalog: DataSeriesAssetRow[] = [
      row({
        name: "Base Salary",
        numeric_format: "excel:#,##0.00",
      }),
      row({ name: "idx.Job Family", value_type: "text", origin_kind: "formula", role_kind: "index" }),
    ];
    const out = inheritNumericFormatFromFormula(
      "MEDIAN_BY([Base Salary], [idx.Job Family])",
      catalog,
    );
    expect(out).toBe("excel:#,##0.00");
  });

  it("returns null when COUNT_BY has no values param", () => {
    const catalog: DataSeriesAssetRow[] = [
      row({ name: "idx.X", value_type: "text", origin_kind: "formula", role_kind: "index" }),
    ];
    const out = inheritNumericFormatFromFormula("COUNT_BY([idx.X])", catalog);
    expect(out).toBeNull();
  });

  it("returns null for unknown function", () => {
    const catalog: DataSeriesAssetRow[] = [
      row({ name: "a", numeric_format: "excel:0" }),
    ];
    const out = inheritNumericFormatFromFormula("NOT_A_FN([a])", catalog);
    expect(out).toBeNull();
  });

  it("returns null when parent has no numeric_format", () => {
    const catalog: DataSeriesAssetRow[] = [
      row({ name: "Base Salary" }),
      row({ name: "idx.J", value_type: "text", origin_kind: "formula", role_kind: "index" }),
    ];
    const out = inheritNumericFormatFromFormula("MEDIAN_BY([Base Salary], [idx.J])", catalog);
    expect(out).toBeNull();
  });

  it("returns null when value series is not numeric", () => {
    const catalog: DataSeriesAssetRow[] = [
      row({ name: "Label", value_type: "text", numeric_format: "excel:0" }),
      row({ name: "idx.J", value_type: "text", origin_kind: "formula", role_kind: "index" }),
    ];
    const out = inheritNumericFormatFromFormula("MEDIAN_BY([Label], [idx.J])", catalog);
    expect(out).toBeNull();
  });

  it("finds MEDIAN_BY inside 1 + … (preorder-first call)", () => {
    const catalog: DataSeriesAssetRow[] = [
      row({ name: "x", numeric_format: "python:.2f" }),
      row({ name: "idx", value_type: "text", origin_kind: "formula", role_kind: "index" }),
    ];
    const out = inheritNumericFormatFromFormula(`1 + MEDIAN_BY([x], [idx])`, catalog);
    expect(out).toBe("python:.2f");
  });
});
