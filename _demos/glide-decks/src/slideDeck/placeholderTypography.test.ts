import { describe, expect, it } from "vitest";
import type { SlideDeckTheme } from "../types/slideDeck";
import {
  getPlaceholderDefaultStyle,
  isTextRunStyleUnset,
  mergeTextRunStyle,
  PLACEHOLDER_TITLE_FONT_SIZE_PT,
} from "./placeholderTypography";

function minimalTheme(): SlideDeckTheme {
  return {
    id: "t1",
    document_id: "d1",
    name: "T",
    color_palette: {
      accent_1: "#000",
      accent_2: "#000",
      accent_3: "#000",
      accent_4: "#000",
      accent_5: "#000",
      accent_6: "#000",
      dark_1: "#000",
      dark_2: "#000",
      light_1: "#fff",
      light_2: "#fff",
    },
    font_config: {
      heading_family: "HeadingFont",
      heading_weight: 800,
      body_family: "BodyFont",
      body_weight: 400,
      monospace_family: "mono",
    },
    bullet_config: [],
    background_fill: { kind: "solid", color: "light_1" },
    master_elements: [],
    default_new_slide_layout_id: null,
    created_at: "",
    updated_at: "",
  };
}

describe("getPlaceholderDefaultStyle", () => {
  it("uses heading stack and weight for title role", () => {
    const theme = minimalTheme();
    const s = getPlaceholderDefaultStyle(theme, "title");
    expect(s.font_family).toBe("HeadingFont");
    expect(s.font_size_pt).toBe(PLACEHOLDER_TITLE_FONT_SIZE_PT);
    expect(s.font_weight).toBe(800);
    expect(s.bold).toBe(true);
    expect(s.color).toMatch(/^#/);
  });

  it("uses body stack for body role", () => {
    const theme = minimalTheme();
    const s = getPlaceholderDefaultStyle(theme, "body");
    expect(s.font_family).toBe("BodyFont");
    expect(s.bold).toBe(false);
  });
});

describe("mergeTextRunStyle", () => {
  it("overrides base with defined keys from override", () => {
    expect(mergeTextRunStyle({ font_size_pt: 12 }, { bold: true })).toEqual({
      font_size_pt: 12,
      bold: true,
    });
  });
});

describe("isTextRunStyleUnset", () => {
  it("is true for empty object", () => {
    expect(isTextRunStyleUnset({})).toBe(true);
  });

  it("is false when a key is set", () => {
    expect(isTextRunStyleUnset({ bold: false })).toBe(false);
  });
});
