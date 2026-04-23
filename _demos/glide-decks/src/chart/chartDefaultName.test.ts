import { describe, expect, it } from "vitest";
import {
  collectTakenNames,
  suggestIndexNameFromParent,
  suggestUniqueFxFormulaName,
  suggestUniqueFxFnDisplayName,
} from "./chartDefaultName";
import type { DataSeriesAssetRow } from "../types/dataModel";

describe("suggestIndexNameFromParent", () => {
  it("uses idx.parent and disambiguates", () => {
    const taken = new Set<string>(["idx.Job Family"]);
    expect(suggestIndexNameFromParent("Job Family", taken)).toBe("idx.Job Family 02");
  });

  it("returns base when free", () => {
    expect(suggestIndexNameFromParent("Job Family", new Set())).toBe("idx.Job Family");
  });
});

describe("suggestUniqueFxFormulaName", () => {
  it("returns fx. Formula 01 when free", () => {
    const taken = collectTakenNames({
      series: [] as DataSeriesAssetRow[],
      dataSources: [],
      charts: [],
    });
    expect(suggestUniqueFxFormulaName(taken)).toBe("fx. Formula 01");
  });
});

describe("suggestUniqueFxFnDisplayName", () => {
  it("allocates fx.FN NN", () => {
    const taken = new Set(["fx.MEDIAN_BY 01"]);
    expect(suggestUniqueFxFnDisplayName("MEDIAN_BY", taken)).toBe("fx.MEDIAN_BY 02");
  });
});
