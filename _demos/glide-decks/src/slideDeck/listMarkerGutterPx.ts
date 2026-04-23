import type { BulletLevel } from "../types/slideDeck/text";
import { remToEmu } from "./remToEmu";
import { emuToPx } from "./units";

/** Horizontal gap (in `rem`, converted with theme scale) between marker gutter and body text. */
export const LIST_MARKER_TO_BODY_GAP_REM = 0.5;

/** Convert typographic points to CSS pixels at 96dpi. */
export function ptToCssPx(pt: number): number {
  return (pt * 96) / 72;
}

/**
 * Rough advance width for the list marker string.
 * Preview/editor render markers at `font_size_pt` (see `SlideTextBoxTypography`); keep this aligned.
 */
export function heuristicMarkerContentPx(marker: string, bl: BulletLevel): number {
  if (!marker) return 0;
  const fs = ptToCssPx(bl.font_size_pt);
  const perChar = fs * 0.55;
  if (/^\d+\.$/.test(marker)) {
    return marker.length * perChar;
  }
  if (marker === "\u2014") {
    return fs * 1.15;
  }
  return fs * 0.85;
}

/**
 * Pixel width reserved for the list marker column plus gap to paragraph text.
 *
 * Layout invariant: body text starts at `indent_emu` from the content edge:
 * `paddingLeft = indentPx - gutterPx` and marker column width `gutterPx`.
 *
 * `BulletLevel.hanging_emu` is a theme-authored minimum gutter; this function
 * expands it when the marker (glyph or `n.`) is wider than that minimum, then
 * adds {@link LIST_MARKER_TO_BODY_GAP_REM}.
 */
export function listMarkerGutterPx(args: {
  hangingEmu: number;
  marker: string;
  bulletLevel: BulletLevel;
  pxPerEmu: number;
}): number {
  const { hangingEmu, marker, bulletLevel, pxPerEmu } = args;
  const base = emuToPx(hangingEmu, pxPerEmu);
  const content = heuristicMarkerContentPx(marker, bulletLevel);
  const gap = emuToPx(remToEmu(LIST_MARKER_TO_BODY_GAP_REM), pxPerEmu);
  return Math.max(base, content) + gap;
}
