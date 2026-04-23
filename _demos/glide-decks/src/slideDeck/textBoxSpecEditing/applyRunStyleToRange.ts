import { mergeTextRunStyle } from "../placeholderTypography";
import type { TextBoxSpec, TextParagraph, TextRun, TextRunStyle } from "../../types/slideDeck";
import { normalizeDocRange, type DocRange, positionToOffset } from "./docPositions";
import { newTextId } from "./ids";
import { coalesceRunsInParagraph, coalesceRunsInParagraphs } from "./coalesceRuns";

function sliceRunWithPatch(
  run: TextRun,
  from: number,
  to: number,
  patch: Partial<TextRunStyle>,
): TextRun[] {
  const len = run.text.length;
  const a = Math.max(0, Math.min(from, len));
  const b = Math.max(0, Math.min(to, len));
  const out: TextRun[] = [];
  if (a > 0) {
    out.push({ ...run, id: newTextId(), text: run.text.slice(0, a), style: { ...run.style } });
  }
  if (b > a) {
    out.push({
      ...run,
      id: newTextId(),
      text: run.text.slice(a, b),
      style: mergeTextRunStyle({ ...run.style }, patch),
    });
  }
  if (b < len) {
    out.push({ ...run, id: newTextId(), text: run.text.slice(b), style: { ...run.style } });
  }
  return out.length > 0 ? out : [{ ...run, id: newTextId(), text: "", style: { ...run.style } }];
}

/** Apply `patch` to every run whose text overlaps [startOff, endOff). */
export function applyRunStyleToRange(
  spec: TextBoxSpec,
  range: DocRange,
  patch: Partial<TextRunStyle>,
): TextBoxSpec {
  const { start, end } = normalizeDocRange(range);
  const startOff = positionToOffset(spec, start);
  const endOff = positionToOffset(spec, end);
  if (startOff == null || endOff == null || startOff >= endOff) {
    return spec;
  }

  let cursor = 0;
  const newParagraphs: TextParagraph[] = spec.paragraphs.map((para, pi) => {
    if (pi > 0) cursor += 1;
    const newRuns: TextRun[] = [];
    for (const run of para.runs) {
      const runStart = cursor;
      const runEnd = cursor + run.text.length;
      cursor = runEnd;

      const overlapStart = Math.max(runStart, startOff);
      const overlapEnd = Math.min(runEnd, endOff);
      if (overlapStart >= overlapEnd) {
        newRuns.push(run);
        continue;
      }

      const localA = overlapStart - runStart;
      const localB = overlapEnd - runStart;
      const pieces = sliceRunWithPatch(run, localA, localB, patch);
      newRuns.push(...pieces);
    }
    return {
      ...para,
      runs: coalesceRunsInParagraph(newRuns),
    };
  });

  return {
    ...spec,
    paragraphs: coalesceRunsInParagraphs(newParagraphs),
  };
}
