import type { TextBoxSpec } from "../types/slideDeck";

/** Minimal empty text box for layout/slide placeholders. */
export function createEmptyTextBoxSpec(): TextBoxSpec {
  return {
    paragraphs: [
      {
        id: "p0",
        runs: [{ id: "r0", text: "", style: {} }],
        paragraph_style: {
          alignment: "left",
          indent_level: 0,
          space_before_pt: 0,
          space_after_pt: 0,
          line_spacing: 1,
          list_style: "none",
        },
      },
    ],
    fill: { kind: "none" },
    border: null,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    auto_fit: "none",
    word_wrap: true,
    vertical_align: "top",
    default_style: {},
  };
}
