import { describe, expect, it } from "vitest";
import type { BulletLevel } from "../types/slideDeck/text";
import { EMU_PER_CSS_PX } from "./remToEmu";
import { heuristicMarkerContentPx, listMarkerGutterPx, LIST_MARKER_TO_BODY_GAP_REM, ptToCssPx } from "./listMarkerGutterPx";
import { remToEmu } from "./remToEmu";
import { emuToPx } from "./units";

const pxPerEmu = 1 / EMU_PER_CSS_PX;

function level12pt(): BulletLevel {
  return {
    level: 1,
    shape: "disc",
    size_pt: 12,
    indent_emu: remToEmu(4.5),
    hanging_emu: remToEmu(0.25),
    space_before_pt: 0,
    space_after_pt: 0,
    font_size_pt: 12,
    font_bold: false,
    font_italic: false,
  };
}

describe("heuristicMarkerContentPx", () => {
  it("treats numbered markers wider as digit count grows", () => {
    const bl = level12pt();
    expect(heuristicMarkerContentPx("1.", bl)).toBeLessThan(heuristicMarkerContentPx("10.", bl));
    expect(heuristicMarkerContentPx("10.", bl)).toBeLessThan(heuristicMarkerContentPx("100.", bl));
  });

  it("reserves more for em dash than a single bullet glyph", () => {
    const bl = level12pt();
    expect(heuristicMarkerContentPx("\u2014", bl)).toBeGreaterThan(heuristicMarkerContentPx("\u2022", bl));
  });
});

describe("listMarkerGutterPx", () => {
  it("adds gap in px consistent with LIST_MARKER_TO_BODY_GAP_REM at default root", () => {
    const bl = level12pt();
    const marker = "\u2022";
    const gapPx = emuToPx(remToEmu(LIST_MARKER_TO_BODY_GAP_REM), pxPerEmu);
    const content = Math.max(emuToPx(bl.hanging_emu, pxPerEmu), heuristicMarkerContentPx(marker, bl));
    const gutter = listMarkerGutterPx({ hangingEmu: bl.hanging_emu, marker, bulletLevel: bl, pxPerEmu });
    expect(gutter).toBeCloseTo(content + gapPx, 5);
  });

  it("expands past theme hanging when the marker needs more room", () => {
    const bl = level12pt();
    const tinyHanging = remToEmu(0.05);
    const marker = "100.";
    const gutter = listMarkerGutterPx({ hangingEmu: tinyHanging, marker, bulletLevel: bl, pxPerEmu });
    const wouldRawHanging = emuToPx(tinyHanging, pxPerEmu) + emuToPx(remToEmu(LIST_MARKER_TO_BODY_GAP_REM), pxPerEmu);
    expect(gutter).toBeGreaterThan(wouldRawHanging);
  });

  it("keeps body indent invariant: paddingLeft + gutter equals indent px", () => {
    const bl = level12pt();
    const indentPx = emuToPx(bl.indent_emu, pxPerEmu);
    const marker = "1.";
    const gutter = listMarkerGutterPx({ hangingEmu: bl.hanging_emu, marker, bulletLevel: bl, pxPerEmu });
    expect(Math.max(0, indentPx - gutter) + gutter).toBe(indentPx);
  });

  it("uses hanging as floor when heuristic is smaller", () => {
    const bl: BulletLevel = {
      ...level12pt(),
      indent_emu: remToEmu(10),
      hanging_emu: remToEmu(4),
      font_size_pt: 6,
    };
    const marker = "\u2022";
    const indentPx = emuToPx(bl.indent_emu, pxPerEmu);
    const gapPx = emuToPx(remToEmu(LIST_MARKER_TO_BODY_GAP_REM), pxPerEmu);
    const gutter = listMarkerGutterPx({ hangingEmu: bl.hanging_emu, marker, bulletLevel: bl, pxPerEmu });
    expect(gutter).toBeCloseTo(emuToPx(bl.hanging_emu, pxPerEmu) + gapPx, 5);
    expect(gutter).toBeLessThanOrEqual(indentPx);
  });
});

describe("ptToCssPx", () => {
  it("maps 12pt to 16 CSS px at 96dpi", () => {
    expect(ptToCssPx(12)).toBe(16);
  });
});
