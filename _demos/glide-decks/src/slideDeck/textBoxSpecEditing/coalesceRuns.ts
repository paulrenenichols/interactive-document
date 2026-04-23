import type { TextParagraph, TextRun, TextRunStyle } from "../../types/slideDeck";
import { newTextId } from "./ids";

function styleEqual(a: TextRunStyle, b: TextRunStyle): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function coalesceRunsInParagraph(runs: TextRun[]): TextRun[] {
  if (runs.length === 0) return [{ id: newTextId(), text: "", style: {} }];
  const out: TextRun[] = [];
  for (const run of runs) {
    if (run.special) {
      out.push({ ...run });
      continue;
    }
    const prev = out[out.length - 1];
    if (prev && !prev.special && styleEqual(prev.style, run.style)) {
      prev.text += run.text;
    } else {
      out.push({ ...run });
    }
  }
  return out;
}

export function coalesceRunsInParagraphs(paragraphs: TextParagraph[]): TextParagraph[] {
  return paragraphs.map((p) => ({
    ...p,
    runs: coalesceRunsInParagraph(p.runs),
  }));
}
