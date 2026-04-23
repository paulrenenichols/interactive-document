import type { ShapeKind } from "../types/slideDeck/shape";
import { MILESTONE_SHAPE_KINDS, type MilestoneShapeKind } from "./createSlideShapeElement";

/** Display labels for milestone shape kinds — shared by Insert Shape menu and Design panel. */
export const MILESTONE_SHAPE_LABELS: Record<MilestoneShapeKind, string> = {
  rectangle: "Rectangle",
  rounded_rectangle: "Rounded rectangle",
  circle: "Circle",
  ellipse: "Ellipse",
  triangle: "Triangle",
  line: "Line",
  arrow: "Arrow",
};

export function isMilestoneShapeKind(k: ShapeKind): k is MilestoneShapeKind {
  return (MILESTONE_SHAPE_KINDS as readonly string[]).includes(k);
}
