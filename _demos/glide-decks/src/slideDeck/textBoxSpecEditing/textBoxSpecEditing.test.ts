import { describe, expect, it } from "vitest";
import type { TextBoxSpec } from "../../types/slideDeck";
import { applyDefaultStyleToWholeBox } from "./applyDefaultStyleToWholeBox";
import { applyRunStyleToRange } from "./applyRunStyleToRange";
import { bumpIndentOnRange, setListStyleOnRange } from "./listAndIndent";
function minimalSpec(overrides?: Partial<TextBoxSpec>): TextBoxSpec {
  return {
    paragraphs: [
      {
        id: "p0",
        runs: [
          { id: "r0", text: "Hello ", style: {} },
          { id: "r1", text: "world", style: { bold: true } },
        ],
        paragraph_style: {
          alignment: "left",
          indent_level: 0,
          space_before_pt: 0,
          space_after_pt: 0,
          line_spacing: 1,
          list_style: "none",
        },
      },
      {
        id: "p1",
        runs: [{ id: "r2", text: "Second", style: {} }],
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
    default_style: { font_size_pt: 12 },
    ...overrides,
  };
}

describe("applyRunStyleToRange", () => {
  it("applies patch only to overlapping substring", () => {
    const spec = minimalSpec();
    const next = applyRunStyleToRange(
      spec,
      {
        anchor: { paragraphIndex: 0, runIndex: 0, offset: 1 },
        focus: { paragraphIndex: 0, runIndex: 1, offset: 3 },
      },
      { color: "#ff0000" },
    );
    expect(next.paragraphs[0]!.runs.map((r) => r.text).join("")).toBe("Hello world");
    const joined = next.paragraphs[0]!.runs;
    const colored = joined.filter((r) => r.style.color === "#ff0000");
    expect(colored.map((r) => r.text).join("")).toBe("ello wor");
  });
});

describe("applyDefaultStyleToWholeBox", () => {
  it("merges patch into default and every run", () => {
    const spec = minimalSpec();
    const next = applyDefaultStyleToWholeBox(spec, { italic: true });
    expect(next.default_style.italic).toBe(true);
    expect(next.paragraphs[0]!.runs.every((r) => r.style.italic === true)).toBe(true);
  });
});

describe("setListStyleOnRange", () => {
  it("sets list on caret paragraph when range is collapsed", () => {
    const spec = minimalSpec();
    const range = {
      anchor: { paragraphIndex: 0, runIndex: 0, offset: 0 },
      focus: { paragraphIndex: 0, runIndex: 0, offset: 0 },
    };
    const next = setListStyleOnRange(spec, range, "bullet");
    expect(next.paragraphs[0]!.paragraph_style.list_style).toBe("bullet");
    expect(next.paragraphs[1]!.paragraph_style.list_style).toBe("none");
  });

  it("sets list on all paragraphs when range is null", () => {
    const spec = minimalSpec();
    const next = setListStyleOnRange(spec, null, "bullet");
    expect(next.paragraphs[0]!.paragraph_style.list_style).toBe("bullet");
    expect(next.paragraphs[1]!.paragraph_style.list_style).toBe("bullet");
  });
});

describe("bumpIndentOnRange", () => {
  it("clamps indent to 0–3", () => {
    const spec = minimalSpec();
    const range = {
      anchor: { paragraphIndex: 0, runIndex: 0, offset: 0 },
      focus: { paragraphIndex: 0, runIndex: 0, offset: 0 },
    };
    let next = spec;
    for (let i = 0; i < 10; i++) {
      next = bumpIndentOnRange(next, range, 1);
    }
    expect(next.paragraphs[0]!.paragraph_style.indent_level).toBe(3);
    for (let i = 0; i < 10; i++) {
      next = bumpIndentOnRange(next, range, -1);
    }
    expect(next.paragraphs[0]!.paragraph_style.indent_level).toBe(0);
  });
});
