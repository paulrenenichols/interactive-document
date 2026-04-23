import { describe, expect, it } from "vitest";
import {
  clampInt,
  commitIntegerDraft,
  filterIntegerDraftInput,
  parseCompleteIntegerInRange,
} from "./parseNumericDraft";

describe("filterIntegerDraftInput", () => {
  it("strips non-digits when unsigned", () => {
    expect(filterIntegerDraftInput("12a3", false)).toBe("123");
    expect(filterIntegerDraftInput("-5", false)).toBe("5");
  });

  it("allows leading minus and digits when signed", () => {
    expect(filterIntegerDraftInput("-", true)).toBe("-");
    expect(filterIntegerDraftInput("-90", true)).toBe("-90");
    expect(filterIntegerDraftInput("--2", true)).toBe("-2");
  });
});

describe("parseCompleteIntegerInRange", () => {
  it("returns null for partial or empty drafts", () => {
    expect(parseCompleteIntegerInRange("", -90, 90, true)).toBeNull();
    expect(parseCompleteIntegerInRange("-", -90, 90, true)).toBeNull();
    expect(parseCompleteIntegerInRange("  ", -90, 90, true)).toBeNull();
  });

  it("returns a number only when in range", () => {
    expect(parseCompleteIntegerInRange("-90", -90, 90, true)).toBe(-90);
    expect(parseCompleteIntegerInRange("90", -90, 90, true)).toBe(90);
    expect(parseCompleteIntegerInRange("-91", -90, 90, true)).toBeNull();
    expect(parseCompleteIntegerInRange("91", -90, 90, true)).toBeNull();
  });

  it("rejects signed forms when allowNegative is false", () => {
    expect(parseCompleteIntegerInRange("-1", 0, 10, false)).toBeNull();
    expect(parseCompleteIntegerInRange("5", 0, 10, false)).toBe(5);
  });
});

describe("commitIntegerDraft", () => {
  it("uses default when empty or lone minus", () => {
    expect(commitIntegerDraft("", -90, 90, 42, true)).toBe(42);
    expect(commitIntegerDraft("-", -90, 90, 0, true)).toBe(0);
    expect(commitIntegerDraft("   ", 0, 400, 8, false)).toBe(8);
  });

  it("clamps valid integers", () => {
    expect(commitIntegerDraft("-90", -90, 90, 0, true)).toBe(-90);
    expect(commitIntegerDraft("100", 0, 400, 8, false)).toBe(100);
    expect(commitIntegerDraft("500", 0, 400, 8, false)).toBe(400);
    expect(commitIntegerDraft("-100", -90, 90, 0, true)).toBe(-90);
  });

  it("falls back to default on garbage", () => {
    expect(commitIntegerDraft("abc", 0, 10, 7, false)).toBe(7);
  });
});

describe("clampInt", () => {
  it("clamps to bounds", () => {
    expect(clampInt(5, 0, 10)).toBe(5);
    expect(clampInt(-1, 0, 10)).toBe(0);
    expect(clampInt(11, 0, 10)).toBe(10);
  });
});
