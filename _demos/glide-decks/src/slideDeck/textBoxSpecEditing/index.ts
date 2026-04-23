export type { DocPosition, DocRange } from "./docPositions";
export {
  compareDocPosition,
  documentTextLength,
  isCollapsedRange,
  normalizeDocRange,
  offsetToPosition,
  positionToOffset,
} from "./docPositions";
export { applyDefaultStyleToWholeBox } from "./applyDefaultStyleToWholeBox";
export { applyRunStyleToRange } from "./applyRunStyleToRange";
export { bumpIndentOnRange, setAlignmentOnRange, setListStyleOnRange } from "./listAndIndent";
export { coalesceRunsInParagraph, coalesceRunsInParagraphs } from "./coalesceRuns";
export { summarizeParagraphFormatsForRange } from "./paragraphFormatSummary";
export type { AlignmentSummary, ListStyleSummary } from "./paragraphFormatSummary";
