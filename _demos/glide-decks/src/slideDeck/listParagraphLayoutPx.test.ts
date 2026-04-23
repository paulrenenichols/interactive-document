import { describe, expect, it } from "vitest";
import type { BulletLevel, ParagraphStyle } from "../types/slideDeck/text";
import { EMU_PER_CSS_PX } from "./remToEmu";
import { paragraphPaddingLeftPx } from "./listParagraphLayoutPx";
import { remToEmu } from "./remToEmu";
import { emuToPx } from "./units";

const pxPerEmu = 1 / EMU_PER_CSS_PX;

function stubBulletLevel(indentRem: number): BulletLevel {
  return {
    level: 1,
    shape: "disc",
    size_pt: 12,
    indent_emu: remToEmu(indentRem),
    hanging_emu: remToEmu(0.25),
    space_before_pt: 0,
    space_after_pt: 0,
    font_size_pt: 12,
    font_bold: false,
    font_italic: false,
  };
}

describe("paragraphPaddingLeftPx", () => {
  it("returns 0 for list_style none", () => {
    const ps: ParagraphStyle = {
      alignment: "left",
      indent_level: 0,
      space_before_pt: 0,
      space_after_pt: 0,
      line_spacing: 1,
      list_style: "none",
    };
    const bl = stubBulletLevel(4.5);
    expect(paragraphPaddingLeftPx(ps, bl, pxPerEmu)).toBe(0);
  });

  it("returns indent px for bullet list", () => {
    const ps: ParagraphStyle = {
      alignment: "left",
      indent_level: 0,
      space_before_pt: 0,
      space_after_pt: 0,
      line_spacing: 1,
      list_style: "bullet",
    };
    const bl = stubBulletLevel(2);
    expect(paragraphPaddingLeftPx(ps, bl, pxPerEmu)).toBe(emuToPx(bl.indent_emu, pxPerEmu));
  });

  it("returns indent px for numbered list", () => {
    const ps: ParagraphStyle = {
      alignment: "left",
      indent_level: 0,
      space_before_pt: 0,
      space_after_pt: 0,
      line_spacing: 1,
      list_style: "numbered",
      numbered_start: 1,
    };
    const bl = stubBulletLevel(3);
    expect(paragraphPaddingLeftPx(ps, bl, pxPerEmu)).toBe(emuToPx(bl.indent_emu, pxPerEmu));
  });
});
