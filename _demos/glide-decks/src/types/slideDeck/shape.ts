import type { FillSpec } from "./fill";

/** slide-deck-spec §8 */
export interface EdgeInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface BorderSpec {
  color: string;
  width_pt: number;
  style: "solid" | "dashed" | "dotted" | "none";
}

export type ShapeKind =
  | "rectangle"
  | "rounded_rectangle"
  | "circle"
  | "ellipse"
  | "line"
  | "arrow"
  | "triangle"
  | "parallelogram"
  | "diamond"
  | "custom_polygon";

export interface LineEndSpec {
  marker: "none" | "arrow" | "arrow_open" | "circle" | "square";
  size: "small" | "medium" | "large";
}

/** Stroke for `line` / `arrow` — see shapes-milestone-spec.md */
export interface LineStrokeSpec {
  weight_pt: number;
  cap: "butt" | "round" | "square";
  style: "solid" | "dashed" | "dotted";
  color: string;
}

/** Optional filled-shaft geometry for arrows — see shapes-milestone-spec.md §4 */
export interface ArrowHeadGeometrySpec {
  head_style: "chevron" | "open" | "blunt" | "circle";
  shaft_weight_ratio: number;
  head_depth_ratio: number;
}

export interface ShapeSpec {
  shape_kind: ShapeKind;
  fill: FillSpec;
  border: BorderSpec | null;
  corner_radius_emu?: number;
  line_start?: LineEndSpec;
  line_end?: LineEndSpec;
  path_data?: string;
  /** Stroke for `line` / `arrow` rendering */
  line_stroke?: LineStrokeSpec;
  /** SVG viewBox for scaling `path_data` on `custom_polygon` */
  path_viewbox?: string;
  /** Natural-language description for AI regeneration (future) */
  path_description?: string;
  /** Optional PowerPoint-style arrow body; omit for marker-only heads */
  arrow_geometry?: ArrowHeadGeometrySpec;
}
