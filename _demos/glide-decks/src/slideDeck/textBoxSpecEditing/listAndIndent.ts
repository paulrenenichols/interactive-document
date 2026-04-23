import type { TextBoxSpec } from "../../types/slideDeck";
import { isCollapsedRange, normalizeDocRange, type DocRange, positionToOffset } from "./docPositions";

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

function paragraphIndicesForParagraphStyleOp(spec: TextBoxSpec, range: DocRange | null): number[] {
  // Product contract:
  // - null range means the shape is selected but not actively edited => apply to all paragraphs
  // - collapsed range means caret editing => apply to the caret paragraph only
  // - non-collapsed means a selection => apply to touched paragraphs
  if (!range) return allParagraphIndices(spec);
  if (isCollapsedRange(range)) {
    const { start } = normalizeDocRange(range);
    const pi = start.paragraphIndex;
    if (pi < 0 || pi >= spec.paragraphs.length) return allParagraphIndices(spec);
    return [pi];
  }
  return paragraphIndicesTouchedNonCollapsed(spec, range);
}

function clampIndent(n: number): 0 | 1 | 2 | 3 {
  const x = Math.max(0, Math.min(3, Math.round(n)));
  return x as 0 | 1 | 2 | 3;
}

export function setListStyleOnRange(
  spec: TextBoxSpec,
  range: DocRange | null,
  listStyle: "none" | "bullet" | "numbered",
): TextBoxSpec {
  const indices = new Set(paragraphIndicesForParagraphStyleOp(spec, range));
  return {
    ...spec,
    paragraphs: spec.paragraphs.map((p, i) => {
      if (!indices.has(i)) return p;
      return {
        ...p,
        paragraph_style: {
          ...p.paragraph_style,
          list_style: listStyle,
        },
      };
    }),
  };
}

export function bumpIndentOnRange(spec: TextBoxSpec, range: DocRange | null, delta: 1 | -1): TextBoxSpec {
  const indices = new Set(paragraphIndicesForParagraphStyleOp(spec, range));
  return {
    ...spec,
    paragraphs: spec.paragraphs.map((p, i) => {
      if (!indices.has(i)) return p;
      const next = clampIndent(p.paragraph_style.indent_level + delta);
      return {
        ...p,
        paragraph_style: {
          ...p.paragraph_style,
          indent_level: next,
        },
      };
    }),
  };
}

export function setAlignmentOnRange(
  spec: TextBoxSpec,
  range: DocRange | null,
  alignment: "left" | "center" | "right" | "justify",
): TextBoxSpec {
  const indices = new Set(paragraphIndicesForParagraphStyleOp(spec, range));
  return {
    ...spec,
    paragraphs: spec.paragraphs.map((p, i) => {
      if (!indices.has(i)) return p;
      if (p.paragraph_style.alignment === alignment) return p;
      return {
        ...p,
        paragraph_style: {
          ...p.paragraph_style,
          alignment,
        },
      };
    }),
  };
}
