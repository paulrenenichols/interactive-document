import { describe, expect, it } from "vitest";
import type { ThemeColorPalette } from "../types/slideDeck/theme";
import { colorPickerValueFromFill, colorPickerValueFromRawColor, normalizeHexForColorInput } from "./colorPickerValue";

const palette: ThemeColorPalette = {
  accent_1: "#111111",
  accent_2: "#222222",
  accent_3: "#333333",
  accent_4: "#444444",
  accent_5: "#555555",
  accent_6: "#666666",
  dark_1: "#000000",
  dark_2: "#010101",
  light_1: "#eeeeee",
  light_2: "#dddddd",
};

describe("normalizeHexForColorInput", () => {
  it("expands 3-digit hex", () => {
    expect(normalizeHexForColorInput("#abc")).toBe("#aabbcc");
  });
  it("lowercases 6-digit hex", () => {
    expect(normalizeHexForColorInput("#ABCDEF")).toBe("#abcdef");
  });
  it("rejects non-hex", () => {
    expect(normalizeHexForColorInput("accent_1")).toBeNull();
  });
});

describe("colorPickerValueFromFill", () => {
  it("uses literal hex on spec", () => {
    expect(colorPickerValueFromFill({ kind: "solid", color: "#336699" }, palette)).toBe("#336699");
  });
  it("resolves palette token", () => {
    expect(colorPickerValueFromFill({ kind: "solid", color: "accent_1" }, palette)).toBe("#111111");
  });
});

describe("colorPickerValueFromRawColor", () => {
  it("falls back when missing", () => {
    expect(colorPickerValueFromRawColor(undefined, palette, "#191c1e")).toBe("#191c1e");
  });
});
