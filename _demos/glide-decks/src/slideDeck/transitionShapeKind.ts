import type { ShapeSpec } from "../types/slideDeck/shape";
import { EMU_PER_POINT } from "../types/slideDeck/constants";
import type { MilestoneShapeKind } from "./createSlideShapeElement";
import { ARROW_LINE_END_DEFAULTS, LINE_STROKE_DEFAULTS, SHAPE_CORNER_RADIUS_DEFAULT_PT } from "./shapeDefaults";

const LINE_END_NONE = { marker: "none" as const, size: "medium" as const };

/**
 * Rebuilds `ShapeSpec` for a new milestone kind while preserving `fill` and `border`.
 * Kind-specific fields follow insert defaults in `createSlideShapeElement` / shape milestone spec.
 */
export function transitionShapeKind(current: ShapeSpec, next: MilestoneShapeKind): ShapeSpec {
  const fill = { ...current.fill };
  const border = current.border === null ? null : { ...current.border };

  const base: ShapeSpec = {
    shape_kind: next,
    fill,
    border,
  };

  switch (next) {
    case "rounded_rectangle":
      return {
        ...base,
        corner_radius_emu:
          current.corner_radius_emu ?? SHAPE_CORNER_RADIUS_DEFAULT_PT * EMU_PER_POINT,
      };
    case "line":
      return {
        ...base,
        line_start: { ...LINE_END_NONE },
        line_end: { ...LINE_END_NONE },
        line_stroke: current.line_stroke ? { ...current.line_stroke } : { ...LINE_STROKE_DEFAULTS },
      };
    case "arrow": {
      const wasArrow = current.shape_kind === "arrow";
      return {
        ...base,
        line_start:
          wasArrow && current.line_start
            ? { ...current.line_start }
            : { ...ARROW_LINE_END_DEFAULTS.line_start },
        line_end:
          wasArrow && current.line_end ? { ...current.line_end } : { ...ARROW_LINE_END_DEFAULTS.line_end },
      };
    }
    default:
      return base;
  }
}
