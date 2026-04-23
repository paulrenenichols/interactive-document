import type { TextBoxSpec } from "../../types/slideDeck";

/** Cursor inside the structured document (run text is measured in UTF-16 code units like DOM). */
export interface DocPosition {
  paragraphIndex: number;
  runIndex: number;
  offset: number;
}

export interface DocRange {
  anchor: DocPosition;
  focus: DocPosition;
}

export function compareDocPosition(a: DocPosition, b: DocPosition): number {
  if (a.paragraphIndex !== b.paragraphIndex) return a.paragraphIndex - b.paragraphIndex;
  if (a.runIndex !== b.runIndex) return a.runIndex - b.runIndex;
  return a.offset - b.offset;
}

/** Returns inclusive start and exclusive end offsets in document order. */
export function normalizeDocRange(range: DocRange): { start: DocPosition; end: DocPosition } {
  const c = compareDocPosition(range.anchor, range.focus);
  if (c <= 0) return { start: range.anchor, end: range.focus };
  return { start: range.focus, end: range.anchor };
}

/**
 * Total length matching `textBoxSpecToPlainText`: run text plus one `\n` between paragraphs
 * (not after the last paragraph).
 */
export function documentTextLength(spec: TextBoxSpec): number {
  let n = 0;
  for (let pi = 0; pi < spec.paragraphs.length; pi++) {
    if (pi > 0) n += 1;
    for (const r of spec.paragraphs[pi]!.runs) {
      n += r.text.length;
    }
  }
  return n;
}

export function positionToOffset(spec: TextBoxSpec, pos: DocPosition): number | null {
  const p = spec.paragraphs[pos.paragraphIndex];
  if (!p) return null;
  const r = p.runs[pos.runIndex];
  if (!r) return null;
  if (pos.offset < 0 || pos.offset > r.text.length) return null;

  let o = 0;
  for (let pi = 0; pi < spec.paragraphs.length; pi++) {
    if (pi > 0) o += 1;
    const para = spec.paragraphs[pi]!;
    for (let ri = 0; ri < para.runs.length; ri++) {
      const run = para.runs[ri]!;
      const len = run.text.length;
      if (pi === pos.paragraphIndex && ri === pos.runIndex) {
        return o + Math.min(pos.offset, len);
      }
      o += len;
    }
  }
  return null;
}

export function offsetToPosition(spec: TextBoxSpec, offset: number): DocPosition | null {
  if (offset < 0) return null;
  let o = 0;
  for (let pi = 0; pi < spec.paragraphs.length; pi++) {
    const para = spec.paragraphs[pi]!;
    if (pi > 0) {
      if (offset === o) {
        return { paragraphIndex: pi, runIndex: 0, offset: 0 };
      }
      o += 1;
    }
    for (let ri = 0; ri < para.runs.length; ri++) {
      const run = para.runs[ri]!;
      const len = run.text.length;
      if (offset < o + len) {
        return { paragraphIndex: pi, runIndex: ri, offset: offset - o };
      }
      o += len;
    }
  }
  if (offset === o) {
    const lastP = spec.paragraphs[spec.paragraphs.length - 1];
    if (!lastP || lastP.runs.length === 0) return { paragraphIndex: 0, runIndex: 0, offset: 0 };
    const lastR = lastP.runs[lastP.runs.length - 1]!;
    return {
      paragraphIndex: spec.paragraphs.length - 1,
      runIndex: lastP.runs.length - 1,
      offset: lastR.text.length,
    };
  }
  return null;
}

export function isCollapsedRange(range: DocRange): boolean {
  return (
    range.anchor.paragraphIndex === range.focus.paragraphIndex &&
    range.anchor.runIndex === range.focus.runIndex &&
    range.anchor.offset === range.focus.offset
  );
}
