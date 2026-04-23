import { describe, expect, it } from "vitest";
import { createEmptyTextBoxSpec } from "./defaultTextBoxSpec";
import {
  applyPlainTextToTextBoxSpec,
  applyTypingWhileTextBoxSelected,
  textBoxSpecToPlainText,
} from "./textBoxSpecPlainText";

describe("applyPlainTextToTextBoxSpec", () => {
  it("seeds run styles from default_style", () => {
    const base = createEmptyTextBoxSpec();
    const spec = {
      ...base,
      default_style: {
        font_family: "CustomFont",
        font_size_pt: 18,
        bold: true,
        color: "#112233",
      },
    };
    const next = applyPlainTextToTextBoxSpec(spec, "Hello");
    expect(next.paragraphs).toHaveLength(1);
    expect(next.paragraphs[0].runs[0].text).toBe("Hello");
    expect(next.paragraphs[0].runs[0].style).toEqual(spec.default_style);
    expect(textBoxSpecToPlainText(next)).toBe("Hello");
  });
});

describe("applyTypingWhileTextBoxSelected", () => {
  it("replaces placeholder hint with the typed character when plain matches hint", () => {
    const base = createEmptyTextBoxSpec();
    const spec = {
      ...applyPlainTextToTextBoxSpec(
        { ...base, placeholder_hint: "Body", placeholder_role: "body" as const },
        "Body",
      ),
    };
    const next = applyTypingWhileTextBoxSelected(spec, "a");
    expect(textBoxSpecToPlainText(next)).toBe("a");
    expect(next.paragraphs).toHaveLength(1);
  });

  it("appends at end when plain text differs from placeholder_hint", () => {
    const base = createEmptyTextBoxSpec();
    const spec = {
      ...applyPlainTextToTextBoxSpec(
        { ...base, placeholder_hint: "Body", placeholder_role: "body" as const },
        "Hello",
      ),
    };
    const next = applyTypingWhileTextBoxSelected(spec, "z");
    expect(textBoxSpecToPlainText(next)).toBe("Helloz");
  });

  it("replaces empty content when hint is empty", () => {
    const base = createEmptyTextBoxSpec();
    const spec = { ...base, placeholder_hint: "" };
    const next = applyTypingWhileTextBoxSelected(spec, "x");
    expect(textBoxSpecToPlainText(next)).toBe("x");
  });
});
