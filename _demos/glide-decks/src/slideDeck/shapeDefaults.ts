import type { FillSpec } from "../types/slideDeck/fill";
import type { LineEndSpec, LineStrokeSpec } from "../types/slideDeck/shape";

/** Default arrow ends: single arrowhead on the “end” side. */
export const ARROW_LINE_END_DEFAULTS: { line_start: LineEndSpec; line_end: LineEndSpec } = {
  line_start: { marker: "none", size: "medium" },
  line_end: { marker: "arrow", size: "medium" },
};

/** Default fill for inserted shapes — palette slot from theme. */
export const SHAPE_FILL_DEFAULTS: Pick<FillSpec, "kind" | "color"> = {
  kind: "solid",
  color: "accent_2",
};

export const LINE_STROKE_DEFAULTS: LineStrokeSpec = {
  weight_pt: 2.0,
  cap: "butt",
  style: "solid",
  color: "dark_1",
};

/** Shortcut for rounded-rectangle authoring in points; convert to EMU with `pt × 12700`. */
export const SHAPE_CORNER_RADIUS_DEFAULT_PT = 8;
