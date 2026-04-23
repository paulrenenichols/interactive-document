import { describe, expect, it } from "vitest";
import { BUILTIN_LAYOUT_IDS } from "./builtInLayouts";
import { createInitialSlideDeckState } from "./initialState";

describe("createInitialSlideDeckState", () => {
  it("uses Precision Ledger theme and two slides matching the first two built-in layouts", () => {
    const state = createInitialSlideDeckState({ documentId: "doc-test", themeId: "theme-test" });
    expect(state.theme.name).toBe("Precision Ledger");
    expect(state.theme.id).toBe("theme-test");
    expect(state.themes).toHaveLength(1);
    expect(state.themes[0]).toBe(state.theme);
    expect(state.layouts.length).toBeGreaterThanOrEqual(2);
    expect(state.slides).toHaveLength(2);
    expect(state.slides[0]!.layout_id).toBe(state.layouts[0]!.id);
    expect(state.slides[1]!.layout_id).toBe(state.layouts[1]!.id);
    const layoutIds = new Set(state.layouts.map((l) => l.id));
    expect(layoutIds.has(BUILTIN_LAYOUT_IDS.salaryVarianceOverview)).toBe(true);
    expect(layoutIds.has(BUILTIN_LAYOUT_IDS.titleAccentTwoSquares)).toBe(true);
  });
});
