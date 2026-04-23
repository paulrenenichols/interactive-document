import { describe, expect, it } from "vitest";
import { EMU_PER_POINT } from "../types/slideDeck/constants";
import { ARROW_LINE_END_DEFAULTS, LINE_STROKE_DEFAULTS, SHAPE_CORNER_RADIUS_DEFAULT_PT } from "./shapeDefaults";
import { transitionShapeKind } from "./transitionShapeKind";

describe("transitionShapeKind", () => {
  it("preserves fill and border when rectangle → line", () => {
    const current = {
      shape_kind: "rectangle" as const,
      fill: { kind: "solid" as const, color: "accent_1", opacity: 0.5 },
      border: { style: "solid" as const, color: "dark_1", width_pt: 2 },
    };
    const next = transitionShapeKind(current, "line");
    expect(next.fill).toEqual(current.fill);
    expect(next.border).toEqual(current.border);
    expect(next.shape_kind).toBe("line");
    expect(next.line_stroke).toEqual(LINE_STROKE_DEFAULTS);
    expect(next.line_start?.marker).toBe("none");
    expect(next.line_end?.marker).toBe("none");
  });

  it("preserves custom line_stroke when switching to line", () => {
    const stroke = { ...LINE_STROKE_DEFAULTS, weight_pt: 5, color: "accent_2" };
    const current = {
      shape_kind: "arrow" as const,
      fill: { kind: "solid" as const, color: "accent_1", opacity: 1 },
      border: null,
      line_start: ARROW_LINE_END_DEFAULTS.line_start,
      line_end: ARROW_LINE_END_DEFAULTS.line_end,
      line_stroke: stroke,
    };
    const next = transitionShapeKind(current, "line");
    expect(next.line_stroke).toEqual(stroke);
    expect(next.line_start?.marker).toBe("none");
    expect(next.line_end?.marker).toBe("none");
  });

  it("applies default corner radius when line → rounded_rectangle without prior radius", () => {
    const current = {
      shape_kind: "line" as const,
      fill: { kind: "none" as const },
      border: null,
      line_start: { marker: "none" as const, size: "medium" as const },
      line_end: { marker: "none" as const, size: "medium" as const },
      line_stroke: { ...LINE_STROKE_DEFAULTS },
    };
    const next = transitionShapeKind(current, "rounded_rectangle");
    expect(next.corner_radius_emu).toBe(SHAPE_CORNER_RADIUS_DEFAULT_PT * EMU_PER_POINT);
    expect(next.fill).toEqual(current.fill);
  });

  it("preserves fill and border when arrow → circle", () => {
    const current = {
      shape_kind: "arrow" as const,
      fill: { kind: "solid" as const, color: "light_1", opacity: 1 },
      border: { style: "dashed" as const, color: "#112233", width_pt: 1 },
      line_start: ARROW_LINE_END_DEFAULTS.line_start,
      line_end: ARROW_LINE_END_DEFAULTS.line_end,
    };
    const next = transitionShapeKind(current, "circle");
    expect(next.shape_kind).toBe("circle");
    expect(next.fill).toEqual(current.fill);
    expect(next.border).toEqual(current.border);
  });

  it("preserves arrow ends when already arrow and switching kind then back is not tested; non-arrow → arrow gets defaults", () => {
    const current = {
      shape_kind: "ellipse" as const,
      fill: { kind: "solid" as const, color: "accent_2", opacity: 1 },
      border: null,
    };
    const next = transitionShapeKind(current, "arrow");
    expect(next.line_start).toEqual(ARROW_LINE_END_DEFAULTS.line_start);
    expect(next.line_end).toEqual(ARROW_LINE_END_DEFAULTS.line_end);
    expect(next.fill).toEqual(current.fill);
  });

  it("preserves line_start and line_end when shape_kind stays arrow", () => {
    const customStart = { marker: "arrow" as const, size: "large" as const };
    const current = {
      shape_kind: "arrow" as const,
      fill: { kind: "solid" as const, color: "accent_1", opacity: 1 },
      border: null,
      line_start: customStart,
      line_end: ARROW_LINE_END_DEFAULTS.line_end,
    };
    const next = transitionShapeKind(current, "arrow");
    expect(next.line_start).toEqual(customStart);
    expect(next.line_end).toEqual(ARROW_LINE_END_DEFAULTS.line_end);
  });
});
