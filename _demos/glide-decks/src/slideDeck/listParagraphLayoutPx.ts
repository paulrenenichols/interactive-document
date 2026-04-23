import type { BulletLevel, ParagraphStyle } from "../types/slideDeck/text";
import { emuToPx } from "./units";

/**
 * CSS `padding-left` for a slide text paragraph in the Lexical editor / preview.
 * Theme `indent_emu` applies only when a list is active; plain body (`list_style: none`) stays flush.
 */
export function paragraphPaddingLeftPx(ps: ParagraphStyle, bl: BulletLevel, pxPerEmu: number): number {
  if (ps.list_style === "none") return 0;
  return emuToPx(bl.indent_emu, pxPerEmu);
}
