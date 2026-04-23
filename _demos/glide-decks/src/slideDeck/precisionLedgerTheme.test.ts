import { describe, expect, it } from "vitest";

import { BUILTIN_THEME_MASTER_IDS } from "./builtinThemeMasterIds";
import { createPrecisionLedgerSlideDeckTheme } from "./precisionLedgerTheme";

describe("createPrecisionLedgerSlideDeckTheme", () => {
  it("includes header title placeholder and accent bar master elements with stable ids", () => {
    const theme = createPrecisionLedgerSlideDeckTheme("doc", "theme-1");
    expect(theme.master_elements).toHaveLength(2);
    expect(theme.master_elements.map((e) => e.id)).toEqual([
      BUILTIN_THEME_MASTER_IDS.titlePlaceholder,
      BUILTIN_THEME_MASTER_IDS.titleAccentBar,
    ]);
    const title = theme.master_elements[0];
    expect(title?.element_type).toBe("placeholder");
    expect(title?.locked).toBe(false);
    const accent = theme.master_elements[1];
    expect(accent?.element_type).toBe("shape");
    expect(accent?.locked).toBe(true);
  });
});
