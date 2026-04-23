/** Convert EMU to CSS pixels at the given scale (px per EMU). */
export function emuToPx(emu: number, pxPerEmu: number): number {
  return emu * pxPerEmu;
}

/** Convert CSS pixels to EMU at the given scale (px per EMU). */
export function pxToEmu(px: number, pxPerEmu: number): number {
  if (pxPerEmu === 0) return 0;
  return px / pxPerEmu;
}
