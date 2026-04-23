import { describe, expect, it } from "vitest";
import type { SlideDeckTheme, TextParagraph } from "../types/slideDeck";
import { bulletCharForShape, computeParagraphMarkers } from "./textParagraphMarkers";

function minimalTheme(): SlideDeckTheme {
  return {
    id: "t",
    document_id: "d",
    name: "Theme",
    color_palette: {
      accent_1: "#000000",
      accent_2: "#000000",
      accent_3: "#000000",
      accent_4: "#000000",
      accent_5: "#000000",
      accent_6: "#000000",
      dark_1: "#000000",
      dark_2: "#000000",
      light_1: "#ffffff",
      light_2: "#ffffff",
    },
    font_config: {
      heading_family: "Inter",
      heading_weight: 700,
      body_family: "Inter",
      body_weight: 400,
      monospace_family: "JetBrains Mono",
    },
    bullet_config: [
      {
        level: 1,
        shape: "disc",
        size_pt: 12,
        indent_emu: 100,
        hanging_emu: 40,
        space_before_pt: 0,
        space_after_pt: 0,
        font_size_pt: 12,
        font_bold: false,
        font_italic: false,
      },
    ],
    background_fill: { kind: "none" },
    master_elements: [],
    default_new_slide_layout_id: null,
    created_at: "now",
    updated_at: "now",
  };
}

function para(list_style: "none" | "bullet" | "numbered", overrides?: Partial<TextParagraph>): TextParagraph {
  return {
    id: crypto.randomUUID(),
    runs: [{ id: crypto.randomUUID(), text: "x", style: {} }],
    paragraph_style: {
      alignment: "left",
      indent_level: 0,
      space_before_pt: 0,
      space_after_pt: 0,
      line_spacing: 1,
      list_style,
    },
    ...overrides,
  };
}

describe("bulletCharForShape", () => {
  it("maps shapes to glyphs", () => {
    expect(bulletCharForShape("disc")).toBe("\u2022");
    expect(bulletCharForShape("circle")).toBe("\u25cb");
    expect(bulletCharForShape("square")).toBe("\u25a1");
    expect(bulletCharForShape("dash")).toBe("\u2014");
    expect(bulletCharForShape("arrow")).toBe("\u2192");
    expect(bulletCharForShape("check")).toBe("\u2713");
    expect(bulletCharForShape("none")).toBe("");
  });

  it("uses custom char for custom shape", () => {
    expect(bulletCharForShape("custom", "*")).toBe("*");
  });
});

describe("computeParagraphMarkers", () => {
  it("numbers consecutive numbered paragraphs and resets after none", () => {
    const theme = minimalTheme();
    const paragraphs = [para("numbered"), para("numbered"), para("none"), para("numbered")];
    const markers = computeParagraphMarkers(paragraphs, theme).map((m) => m.marker);
    expect(markers).toEqual(["1.", "2.", null, "1."]);
  });

  it("honors numbered_start", () => {
    const theme = minimalTheme();
    const paragraphs = [para("numbered", { paragraph_style: { ...para("numbered").paragraph_style, numbered_start: 10 } })];
    const markers = computeParagraphMarkers(paragraphs, theme).map((m) => m.marker);
    expect(markers).toEqual(["10."]);
  });
});

