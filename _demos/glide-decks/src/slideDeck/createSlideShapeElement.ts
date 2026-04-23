import type { ShapeSpec, ShapeSlideElement, SlideElement } from "../types/slideDeck";
import {
  DEFAULT_SLIDE_HEIGHT_EMU,
  DEFAULT_SLIDE_WIDTH_EMU,
  EMU_PER_INCH,
  EMU_PER_POINT,
} from "../types/slideDeck/constants";
import {
  ARROW_LINE_END_DEFAULTS,
  LINE_STROKE_DEFAULTS,
  SHAPE_CORNER_RADIUS_DEFAULT_PT,
  SHAPE_FILL_DEFAULTS,
} from "./shapeDefaults";

/** In-scope shape kinds for Insert Shape menu (shapes-milestone-spec §1–2). */
export const MILESTONE_SHAPE_KINDS = [
  "rectangle",
  "rounded_rectangle",
  "circle",
  "ellipse",
  "triangle",
  "line",
  "arrow",
] as const;

export type MilestoneShapeKind = (typeof MILESTONE_SHAPE_KINDS)[number];

/** Default inserted rect-like shapes: centered ~2 in square. */
const DEFAULT_BOX_EMU = Math.floor(2 * EMU_PER_INCH);

/** Ellipse: non-square ~3 in × ~2 in. */
const ELLIPSE_WIDTH_EMU = Math.floor(3 * EMU_PER_INCH);
const ELLIPSE_HEIGHT_EMU = Math.floor(2 * EMU_PER_INCH);

/** Line: wide horizontal strip, grabbable height (~0.12 in). */
const LINE_WIDTH_EMU = Math.floor(6 * EMU_PER_INCH);
const LINE_HEIGHT_EMU = Math.floor(0.12 * EMU_PER_INCH);

const LINE_END_NONE = { marker: "none" as const, size: "medium" as const };

function nowIso(): string {
  return new Date().toISOString();
}

function buildSpec(kind: MilestoneShapeKind): ShapeSpec {
  switch (kind) {
    case "rectangle":
    case "circle":
    case "triangle":
      return {
        shape_kind: kind,
        fill: { ...SHAPE_FILL_DEFAULTS, opacity: 1 },
        border: null,
      };
    case "rounded_rectangle":
      return {
        shape_kind: "rounded_rectangle",
        fill: { ...SHAPE_FILL_DEFAULTS, opacity: 1 },
        border: null,
        corner_radius_emu: SHAPE_CORNER_RADIUS_DEFAULT_PT * EMU_PER_POINT,
      };
    case "ellipse":
      return {
        shape_kind: "ellipse",
        fill: { ...SHAPE_FILL_DEFAULTS, opacity: 1 },
        border: null,
      };
    case "line":
      return {
        shape_kind: "line",
        fill: { kind: "none" },
        border: null,
        line_start: LINE_END_NONE,
        line_end: LINE_END_NONE,
        line_stroke: { ...LINE_STROKE_DEFAULTS },
      };
    case "arrow":
      return {
        shape_kind: "arrow",
        fill: { ...SHAPE_FILL_DEFAULTS, opacity: 1 },
        border: null,
        line_start: { ...ARROW_LINE_END_DEFAULTS.line_start },
        line_end: { ...ARROW_LINE_END_DEFAULTS.line_end },
      };
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function boxForKind(kind: MilestoneShapeKind): { width: number; height: number } {
  switch (kind) {
    case "ellipse":
      return { width: ELLIPSE_WIDTH_EMU, height: ELLIPSE_HEIGHT_EMU };
    case "line":
      return { width: LINE_WIDTH_EMU, height: LINE_HEIGHT_EMU };
    case "rectangle":
    case "rounded_rectangle":
    case "circle":
    case "triangle":
    case "arrow":
      return { width: DEFAULT_BOX_EMU, height: DEFAULT_BOX_EMU };
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

/** Inserts a centered slide shape with defaults for the given milestone kind. */
export function createSlideShapeElement(
  slideId: string,
  existingElements: SlideElement[],
  kind: MilestoneShapeKind,
): ShapeSlideElement {
  const t = nowIso();
  const maxZ = existingElements.length === 0 ? 0 : Math.max(...existingElements.map((e) => e.z_index));
  const { width: w, height: h } = boxForKind(kind);
  const x = Math.floor((DEFAULT_SLIDE_WIDTH_EMU - w) / 2);
  const y = Math.floor((DEFAULT_SLIDE_HEIGHT_EMU - h) / 2);
  return {
    id: crypto.randomUUID(),
    slide_id: slideId,
    element_type: "shape",
    x,
    y,
    width: w,
    height: h,
    rotation_deg: 0,
    z_index: maxZ + 1,
    locked: false,
    hidden: false,
    spec: buildSpec(kind),
    created_at: t,
    updated_at: t,
  };
}
