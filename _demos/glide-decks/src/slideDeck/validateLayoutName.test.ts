import { describe, expect, it } from "vitest";
import type { SlideDeckLayout } from "../types/slideDeck";
import { validateLayoutName } from "./validateLayoutName";

function L(id: string, themeId: string, name: string): SlideDeckLayout {
  const t = "2020-01-01T00:00:00.000Z";
  return {
    id,
    document_id: "d",
    theme_id: themeId,
    name,
    description: null,
    thumbnail_asset_id: null,
    elements: [],
    background_fill_override: null,
    created_at: t,
    updated_at: t,
  };
}

describe("validateLayoutName", () => {
  const theme = "theme-a";
  const layouts = [L("a", theme, "Title"), L("b", theme, "Content")];

  it("accepts unique name", () => {
    expect(validateLayoutName(layouts, theme, "c", "New").ok).toBe(true);
  });

  it("rejects empty", () => {
    const r = validateLayoutName(layouts, theme, "a", "  ");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/empty/i);
  });

  it("rejects duplicate case-insensitive", () => {
    const r = validateLayoutName(layouts, theme, "c", "title");
    expect(r.ok).toBe(false);
  });

  it("allows same layout to keep its name", () => {
    expect(validateLayoutName(layouts, theme, "a", "Title").ok).toBe(true);
  });

  it("ignores layouts in other themes", () => {
    const themeAOnly = [L("b", theme, "Content")];
    const other = [L("x", "theme-b", "Title")];
    expect(validateLayoutName([...themeAOnly, ...other], theme, "c", "Title").ok).toBe(true);
  });
});
