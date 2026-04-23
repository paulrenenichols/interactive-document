import { EMU_PER_INCH } from "../types/slideDeck/constants";

/** Convert EMU to inches (slide-deck-spec §3). */
export function emuToInches(emu: number): number {
  return emu / EMU_PER_INCH;
}

/** Convert inches to EMU; rounds to nearest EMU. */
export function inchesToEmu(inches: number): number {
  return Math.round(inches * EMU_PER_INCH);
}

/** Round inches for display / stable commit (2 decimal places). */
export function roundInches2(inches: number): number {
  return Math.round(inches * 100) / 100;
}
