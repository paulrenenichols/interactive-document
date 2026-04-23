import { describe, expect, it } from "vitest";
import type { LayoutElement } from "../types/slideDeck";
import { createPrecisionLedgerSlideDeckTheme } from "./precisionLedgerTheme";
import { buildTextBoxSpecForLayoutPlaceholder } from "./materializeLayoutTextBox";
import { textBoxSpecToPlainText } from "./textBoxSpecPlainText";

describe("buildTextBoxSpecForLayoutPlaceholder", () => {
  it("preserves plain text while resetting to layout default styling", () => {
    const theme = createPrecisionLedgerSlideDeckTheme("doc", "theme-1");
    const layoutEl: LayoutElement = {
      id: "ph1",
      element_type: "placeholder",
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      z_index: 1,
      placeholder_role: "title",
      spec: {
        paragraphs: [],
        fill: { kind: "solid", color: "light_1" },
        border: null,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        auto_fit: "none",
        word_wrap: true,
        vertical_align: "top",
        placeholder_role: "title",
        placeholder_hint: "Hint",
        default_style: { color: "#191c1e", font_size_pt: 30, font_weight: 800, bold: true },
      },
    };
    const spec = buildTextBoxSpecForLayoutPlaceholder(layoutEl, theme, "User typed this");
    expect(textBoxSpecToPlainText(spec)).toBe("User typed this");
    expect(spec.default_style?.font_size_pt).toBe(30);
    expect(spec.fill?.kind).toBe("solid");
  });
});
