import type { BorderSpec, LineStrokeSpec } from "../types/slideDeck/shape";

/** Dash pattern scale follows shapes-milestone-spec §4 (relative to stroke width / zoom). */
export function svgBorderDashArray(style: BorderSpec["style"], scale: number): string | undefined {
  if (style === "solid" || style === "none") return undefined;
  if (style === "dashed") return `${8 * scale} ${4 * scale}`;
  if (style === "dotted") return `${2 * scale} ${3 * scale}`;
  return undefined;
}

export function svgLineStrokeDashArray(style: LineStrokeSpec["style"], scale: number): string | undefined {
  if (style === "solid") return undefined;
  if (style === "dashed") return `${8 * scale} ${4 * scale}`;
  if (style === "dotted") return `${2 * scale} ${3 * scale}`;
  return undefined;
}
