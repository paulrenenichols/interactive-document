import { describe, expect, it } from "vitest";
import { EMU_PER_INCH } from "../types/slideDeck/constants";
import { emuToInches, inchesToEmu, roundInches2 } from "./emuInches";

describe("emuInches", () => {
  it("round-trips inches through EMU", () => {
    const inches = 5.25;
    const emu = inchesToEmu(inches);
    expect(emuToInches(emu)).toBeCloseTo(inches, 5);
  });

  it("roundInches2 matches 2 decimal places", () => {
    expect(roundInches2(1.234)).toBe(1.23);
    expect(roundInches2(EMU_PER_INCH / EMU_PER_INCH)).toBe(1);
  });
});
