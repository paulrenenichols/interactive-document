import { describe, expect, it } from "vitest";

import type { TextBoxSpec } from "../types/slideDeck";
import { BUILTIN_THEME_MASTER_IDS } from "./builtinThemeMasterIds";
import { createPrecisionLedgerSlideDeckTheme } from "./precisionLedgerTheme";

import { createTitleAccentTwoSquaresLayout } from "./salaryVarianceLayout";

describe("createTitleAccentTwoSquaresLayout", () => {
  it("has two equal square chart placeholders; slide title and accent live on the theme", () => {
    const theme = createPrecisionLedgerSlideDeckTheme("doc", "theme-1");

    const layout = createTitleAccentTwoSquaresLayout(theme, "doc", "layout-1");

    const charts = layout.elements.filter((e) => e.element_type === "placeholder" && e.placeholder_role === "chart");

    expect(charts).toHaveLength(2);

    for (const c of charts) {
      expect(c.width).toBe(c.height);
      expect(c.width).toBeGreaterThan(0);
    }

    expect(charts[0]!.width).toBe(charts[1]!.width);

    expect(layout.elements.some((e) => e.placeholder_role === "title")).toBe(false);
    expect(layout.elements.some((e) => e.element_type === "shape")).toBe(false);

    const titleMaster = theme.master_elements.find((e) => e.id === BUILTIN_THEME_MASTER_IDS.titlePlaceholder);
    expect(titleMaster?.element_type).toBe("placeholder");
    const titleSpec = titleMaster?.spec as TextBoxSpec;
    expect(titleSpec.default_style.color).toBe("#191c1e");
    expect(titleSpec.default_style.font_size_pt).toBe(30);
    expect(titleSpec.default_style.font_weight).toBe(800);

    const accent = theme.master_elements.find((e) => e.id === BUILTIN_THEME_MASTER_IDS.titleAccentBar);
    expect(accent?.element_type).toBe("shape");
  });
});
