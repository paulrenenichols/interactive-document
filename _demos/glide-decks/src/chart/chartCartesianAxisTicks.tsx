import type { SVGProps } from "react";
import { Text } from "recharts";
import type { AxisTickMarkDisplay, AxisVisualConfig } from "../types/dataModel";

export type CartesianAxisOrientation = "bottom" | "top" | "left" | "right";

const DEFAULT_TICK_SIZE = 6;
const DEFAULT_TICK_MARGIN = 2;

/** Perpendicular-axis coordinate of the axis line, derived from Recharts text anchor and default tick geometry. */
function axisLineCoordFromText(
  orientation: CartesianAxisOrientation,
  textX: number,
  textY: number,
  tickSize: number,
  tickMargin: number,
): number {
  switch (orientation) {
    case "bottom":
      return textY - tickMargin - tickSize;
    case "top":
      return textY + tickMargin + tickSize;
    case "left":
      return textX + tickMargin + tickSize;
    case "right":
      return textX - tickMargin - tickSize;
    default:
      return textY;
  }
}

/**
 * Renders Excel-style **cross** ticks (symmetric about the axis line) plus optional tick labels.
 * Used with `tickLine={false}` on the parent axis.
 */
export function ChartCartesianCrossTick(
  props: Record<string, unknown> & {
    orientation: CartesianAxisOrientation;
    tickMarkDisplay: Extract<AxisTickMarkDisplay, "cross">;
    showTickLabels: boolean;
    lineStroke: string;
    lineStrokeWidth: number;
  },
) {
  const {
    x: tx,
    y: ty,
    payload: payloadRaw,
    index,
    tickFormatter,
    orientation,
    showTickLabels,
    lineStroke,
    lineStrokeWidth,
    fill,
    tickSize: tickSizeProp,
    tickMargin: tickMarginProp,
  } = props;
  const textX = Number(tx ?? 0);
  const textY = Number(ty ?? 0);
  const payload = payloadRaw as { value: unknown; coordinate: number };
  const tickSize = Number(tickSizeProp ?? DEFAULT_TICK_SIZE);
  const tickMargin = Number(tickMarginProp ?? DEFAULT_TICK_MARGIN);
  const half = tickSize / 2;
  const value = payload.value;
  const fmt =
    typeof tickFormatter === "function"
      ? tickFormatter
      : (v: unknown, _i: number) => String(v ?? "");
  const idx = typeof index === "number" ? index : 0;
  const label = fmt(value, idx);

  const along = payload.coordinate;
  const span = axisLineCoordFromText(orientation, textX, textY, tickSize, tickMargin);

  let x1: number;
  let y1: number;
  let x2: number;
  let y2: number;
  if (orientation === "bottom" || orientation === "top") {
    x1 = along;
    x2 = along;
    y1 = span - half;
    y2 = span + half;
  } else {
    y1 = along;
    y2 = along;
    x1 = span - half;
    x2 = span + half;
  }

  const lineProps: SVGProps<SVGLineElement> = {
    stroke: lineStroke,
    strokeWidth: lineStrokeWidth,
    fill: "none",
    x1,
    y1,
    x2,
    y2,
  };

  return (
    <g className="recharts-cartesian-axis-tick">
      <line {...lineProps} className="recharts-cartesian-axis-tick-line" />
      {showTickLabels && (
        <Text
          x={textX}
          y={textY}
          fill={(fill as string | undefined) ?? lineStroke}
          stroke="none"
          className="recharts-cartesian-axis-tick-value"
          fontSize={props.fontSize as number | undefined}
          fontFamily={props.fontFamily as string | undefined}
          // Recharts passes SVG text anchors; types differ from MUI.
          {...({ textAnchor: props.textAnchor, verticalAnchor: props.verticalAnchor } as object)}
        >
          {label}
        </Text>
      )}
    </g>
  );
}

export interface BuildCartesianAxisTickArgs {
  axisVisual: AxisVisualConfig;
  orientation: CartesianAxisOrientation;
  tickFormatter?: (value: unknown, index: number) => string;
}

/** Bundle passed to Recharts `XAxis` / `YAxis` (Recharts .d.ts mismatches line vs text SVG props). */
export type RechartsAxisTickBundle = {
  tickLine: unknown;
  tickSize?: number;
  tick: unknown;
  tickFormatter?: (value: unknown, index: number) => string;
};

/**
 * Maps persisted axis visual to Recharts `tick` / `tickLine` / `tickSize` props.
 */
export function buildRechartsAxisTickProps(args: BuildCartesianAxisTickArgs): RechartsAxisTickBundle {
  const { axisVisual, orientation, tickFormatter } = args;
  const { tickMarkDisplay, showTickLabels } = axisVisual;
  const stroke = axisVisual.axisColor;
  const w = Math.max(1, axisVisual.axisThicknessPx);
  const tickLineSvg: SVGProps<SVGLineElement> = { stroke, strokeWidth: w, fill: "none" };

  if (tickMarkDisplay === "cross") {
    return {
      tickLine: false,
      tick: (tickProps: Record<string, unknown>) => (
        <ChartCartesianCrossTick
          {...tickProps}
          orientation={orientation}
          tickMarkDisplay="cross"
          showTickLabels={showTickLabels}
          lineStroke={stroke}
          lineStrokeWidth={w}
        />
      ),
      /** Recharts merges this into each tick so the custom renderer can format labels. */
      tickFormatter: showTickLabels ? tickFormatter : undefined,
    };
  }

  if (tickMarkDisplay === "none") {
    return {
      tickLine: false,
      tick: showTickLabels,
      tickFormatter: showTickLabels ? tickFormatter : undefined,
    };
  }

  const tickSize = tickMarkDisplay === "inside" ? -DEFAULT_TICK_SIZE : DEFAULT_TICK_SIZE;
  return {
    tickLine: tickLineSvg,
    tickSize,
    tick: showTickLabels,
    tickFormatter: showTickLabels ? tickFormatter : undefined,
  };
}
