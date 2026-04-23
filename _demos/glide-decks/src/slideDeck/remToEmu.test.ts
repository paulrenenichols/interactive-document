import { describe, expect, it } from "vitest";
import { remToEmu } from "./remToEmu";

describe("remToEmu", () => {
  it("maps 1.25rem at 16px root to EMU matching slide-deck-spec §3", () => {
    const emu = remToEmu(1.25, 16);
    expect(emu).toBe(Math.round(1.25 * 16 * (914_400 / 96)));
  });
});
