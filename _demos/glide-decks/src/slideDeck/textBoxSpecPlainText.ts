import type { TextBoxSpec, TextParagraph } from "../types/slideDeck";

/** Append a character to the end of the document (typing-to-start-edit). */
export function appendCharToTextBoxSpec(spec: TextBoxSpec, ch: string): TextBoxSpec {
  const paragraphs = spec.paragraphs.map((p) => ({
    ...p,
    runs: p.runs.map((r) => ({ ...r })),
  }));
  const lastP = paragraphs[paragraphs.length - 1];
  if (!lastP) {
    return spec;
  }
  if (lastP.runs.length === 0) {
    lastP.runs.push({ id: crypto.randomUUID(), text: ch, style: { ...spec.default_style } });
  } else {
    const lr = lastP.runs[lastP.runs.length - 1]!;
    lr.text += ch;
  }
  return { ...spec, paragraphs };
}

export function textBoxSpecToPlainText(spec: TextBoxSpec): string {
  return spec.paragraphs.map((p) => p.runs.map((r) => r.text).join("")).join("\n");
}

export function applyPlainTextToTextBoxSpec(spec: TextBoxSpec, plain: string): TextBoxSpec {
  const basePara = spec.paragraphs[0];
  const paragraph_style = basePara?.paragraph_style ?? {
    alignment: "left" as const,
    indent_level: 0,
    space_before_pt: 0,
    space_after_pt: 0,
    line_spacing: 1,
    list_style: "none" as const,
  };
  const lines = plain.split("\n");
  const defaultRunStyle = spec.default_style ?? {};
  const paragraphs: TextParagraph[] = lines.map((line, i) => ({
    id: `p${i}`,
    runs: [{ id: `r${i}`, text: line, style: { ...defaultRunStyle } }],
    paragraph_style: { ...paragraph_style },
  }));
  return { ...spec, paragraphs };
}

/**
 * Typing while a text box is selected (not yet in Lexical): replace placeholder hint with the typed
 * character when plain text still matches `placeholder_hint`; otherwise append at end of document.
 */
export function applyTypingWhileTextBoxSelected(spec: TextBoxSpec, ch: string): TextBoxSpec {
  const plain = textBoxSpecToPlainText(spec);
  const hint = spec.placeholder_hint ?? "";
  if (plain === hint) {
    return applyPlainTextToTextBoxSpec(spec, ch);
  }
  return appendCharToTextBoxSpec(spec, ch);
}
