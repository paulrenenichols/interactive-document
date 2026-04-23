import { mergeTextRunStyle } from "../placeholderTypography";
import type { TextBoxSpec, TextRunStyle } from "../../types/slideDeck";

/** Merge `patch` into `default_style` and into every run (whole-box styling from Design panel). */
export function applyDefaultStyleToWholeBox(spec: TextBoxSpec, patch: Partial<TextRunStyle>): TextBoxSpec {
  const newDefault = mergeTextRunStyle(spec.default_style ?? {}, patch);
  return {
    ...spec,
    default_style: newDefault,
    paragraphs: spec.paragraphs.map((p) => ({
      ...p,
      runs: p.runs.map((r) => ({
        ...r,
        style: mergeTextRunStyle(r.style, patch),
      })),
    })),
  };
}
