import type { TextBoxSpec } from "../types/slideDeck";

/** Title/subtitle stay single-line for Enter-to-commit UX; body and other roles use multi-paragraph editing. */
export function getParagraphEditingMode(spec: TextBoxSpec): "single_line" | "multi_paragraph" {
  if (spec.paragraph_editing) return spec.paragraph_editing;
  const role = spec.placeholder_role;
  if (role === "title" || role === "subtitle") return "single_line";
  return "multi_paragraph";
}
