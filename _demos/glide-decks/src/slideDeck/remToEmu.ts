/**
 * EMU per CSS pixel at 96dpi (slide-deck-spec §3: 1 in = 914_400 EMU, 96 px = 1 in).
 */
export const EMU_PER_CSS_PX = 914_400 / 96;

/** Default root `rem` size in px for theme math (browser default). */
export const ROOT_REM_PX = 16;

/** Convert `rem` to EMU using a root font size in px (default 16). */
export function remToEmu(rem: number, rootFontPx: number = ROOT_REM_PX): number {
  return Math.round(rem * rootFontPx * EMU_PER_CSS_PX);
}
