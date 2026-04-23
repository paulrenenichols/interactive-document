import type { TextBoxSpec } from "../../types/slideDeck";
import { isCollapsedRange, normalizeDocRange, type DocRange, positionToOffset } from "./docPositions";

export type ListStyleSummary = "none" | "bullet" | "numbered" | "mixed";
export type AlignmentSummary = "left" | "center" | "right" | "justify" | "mixed";

function allParagraphIndices(spec: TextBoxSpec): number[] {
  return spec.paragraphs.map((_, i) => i);
}

function paragraphIndicesTouchedNonCollapsed(spec: TextBoxSpec, range: DocRange): number[] {
  const { start, end } = normalizeDocRange(range);
  const startOff = positionToOffset(spec, start);
  const endOff = positionToOffset(spec, end);
  if (startOff == null || endOff == null || startOff >= endOff) {
    return allParagraphIndices(spec);
  }

  let cursor = 0;
  const touched: number[] = [];
  for (let pi = 0; pi < spec.paragraphs.length; pi++) {
    if (pi > 0) cursor += 1;
    const para = spec.paragraphs[pi]!;
    const len = para.runs.reduce((s, r) => s + r.text.length, 0);
    const pStart = cursor;
    const pEnd = cursor + len;
    if (pEnd > startOff && pStart < endOff) touched.push(pi);
    cursor = pEnd;
  }
  return touched.length > 0 ? touched : allParagraphIndices(spec);
}

function paragraphIndicesForSummary(spec: TextBoxSpec, range: DocRange | null): number[] {
  if (!range) return allParagraphIndices(spec);
  if (isCollapsedRange(range)) {
    const { start } = normalizeDocRange(range);
    const pi = start.paragraphIndex;
    if (pi < 0 || pi >= spec.paragraphs.length) return allParagraphIndices(spec);
    return [pi];
  }
  return paragraphIndicesTouchedNonCollapsed(spec, range);
}

export function summarizeParagraphFormatsForRange(
  spec: TextBoxSpec,
  range: DocRange | null,
): { listStyle: ListStyleSummary; alignment: AlignmentSummary } {
  const indices = paragraphIndicesForSummary(spec, range);
  if (indices.length === 0) {
    return { listStyle: "mixed", alignment: "mixed" };
  }

  let listStyle: ListStyleSummary | null = null;
  let alignment: AlignmentSummary | null = null;

  for (const i of indices) {
    const p = spec.paragraphs[i];
    if (!p) continue;
    const ls = p.paragraph_style.list_style;
    const a = p.paragraph_style.alignment;

    if (listStyle == null) listStyle = ls;
    else if (listStyle !== ls) listStyle = "mixed";

    if (alignment == null) alignment = a;
    else if (alignment !== a) alignment = "mixed";

    if (listStyle === "mixed" && alignment === "mixed") break;
  }

  return {
    listStyle: (listStyle ?? "mixed") as ListStyleSummary,
    alignment: (alignment ?? "mixed") as AlignmentSummary,
  };
}

