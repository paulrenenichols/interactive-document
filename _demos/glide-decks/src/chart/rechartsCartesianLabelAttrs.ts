/** Matches Recharts `getAttrsOfCartesianLabel` for axis title placement. */
export type CartesianAxisLabelPosition =
  | "insideBottom"
  | "insideTop"
  | "insideLeft"
  | "insideRight"
  | "bottom"
  | "top";

/**
 * Matches Recharts `getAttrsOfCartesianLabel` for the `inside*` positions used by chart axis labels.
 * Used when rendering custom `Label` `content` so coordinates align with default axis labels.
 */
export function cartesianInsideLabelAttrs(
  viewBox: { x: number; y: number; width: number; height: number },
  position: "insideBottom" | "insideTop" | "insideLeft" | "insideRight",
  offset = 5,
): { x: number; y: number; textAnchor: "start" | "middle" | "end" } {
  const { x, y, width, height } = viewBox;
  const verticalSign = height >= 0 ? 1 : -1;
  const verticalOffset = verticalSign * offset;
  const horizontalSign = width >= 0 ? 1 : -1;
  const horizontalOffset = horizontalSign * offset;
  const horizontalEnd = horizontalSign > 0 ? "end" : "start";
  const horizontalStart = horizontalSign > 0 ? "start" : "end";

  switch (position) {
    case "insideLeft":
      return {
        x: x + horizontalOffset,
        y: y + height / 2,
        textAnchor: horizontalEnd,
      };
    case "insideRight":
      return {
        x: x + width - horizontalOffset,
        y: y + height / 2,
        textAnchor: horizontalStart,
      };
    case "insideTop":
      return {
        x: x + width / 2,
        y: y + verticalOffset,
        textAnchor: "middle",
      };
    case "insideBottom":
    default:
      return {
        x: x + width / 2,
        y: y + height - verticalOffset,
        textAnchor: "middle",
      };
  }
}

/**
 * Full set of axis label positions, including `bottom` / `top` (outside the axis band — avoids overlap with ticks).
 * Mirrors [`getAttrsOfCartesianLabel`](node_modules/recharts/es6/component/Label.js).
 */
export function cartesianAxisLabelAttrs(
  viewBox: { x: number; y: number; width: number; height: number },
  position: CartesianAxisLabelPosition,
  offset = 5,
): {
  x: number;
  y: number;
  textAnchor: "start" | "middle" | "end";
  dominantBaseline: "central" | "hanging" | "auto";
} {
  const { x, y, width, height } = viewBox;
  const verticalSign = height >= 0 ? 1 : -1;
  const verticalOffset = verticalSign * offset;

  if (position === "bottom") {
    return {
      x: x + width / 2,
      y: y + height + verticalOffset,
      textAnchor: "middle",
      dominantBaseline: "hanging",
    };
  }
  if (position === "top") {
    return {
      x: x + width / 2,
      y: y - verticalSign * offset,
      textAnchor: "middle",
      dominantBaseline: "auto",
    };
  }
  const inner = cartesianInsideLabelAttrs(
    viewBox,
    position as "insideBottom" | "insideTop" | "insideLeft" | "insideRight",
    offset,
  );
  return { ...inner, dominantBaseline: "central" };
}
