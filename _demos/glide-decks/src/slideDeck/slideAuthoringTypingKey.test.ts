import { describe, expect, it } from "vitest";
import { isSlideAuthoringTypingKey } from "./slideAuthoringTypingKey";

describe("isSlideAuthoringTypingKey", () => {
  it("accepts ASCII letters and digits", () => {
    expect(isSlideAuthoringTypingKey({ key: "a" })).toBe(true);
    expect(isSlideAuthoringTypingKey({ key: "Z" })).toBe(true);
    expect(isSlideAuthoringTypingKey({ key: "7" })).toBe(true);
  });

  it("accepts single Unicode letters", () => {
    expect(isSlideAuthoringTypingKey({ key: "é" })).toBe(true);
    expect(isSlideAuthoringTypingKey({ key: "ñ" })).toBe(true);
  });

  it("rejects Space and punctuation", () => {
    expect(isSlideAuthoringTypingKey({ key: " " })).toBe(false);
    expect(isSlideAuthoringTypingKey({ key: "-" })).toBe(false);
    expect(isSlideAuthoringTypingKey({ key: "." })).toBe(false);
  });

  it("rejects multi-code-unit keys", () => {
    expect(isSlideAuthoringTypingKey({ key: "Enter" })).toBe(false);
    expect(isSlideAuthoringTypingKey({ key: "Tab" })).toBe(false);
    expect(isSlideAuthoringTypingKey({ key: "ArrowLeft" })).toBe(false);
  });
});
