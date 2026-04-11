import { CHART_SERIES_COLORS } from "../theme/tokens";

/** Minor accent: left border uses chart palette; background is a soft tint for layer / series rows. */
export const LAYER_BORDER_COLORS = CHART_SERIES_COLORS;

export const LAYER_SURFACE_TINT: readonly string[] = [
  "rgba(184, 200, 232, 0.45)",
  "rgba(232, 71, 42, 0.1)",
  "rgba(63, 96, 128, 0.12)",
  "rgba(255, 193, 58, 0.2)",
  "rgba(58, 138, 40, 0.12)",
  "rgba(188, 48, 32, 0.08)",
];

export function layerBorderColor(layerIndex: number): string {
  return LAYER_BORDER_COLORS[layerIndex % LAYER_BORDER_COLORS.length];
}

export function layerSurfaceTint(layerIndex: number): string {
  return LAYER_SURFACE_TINT[layerIndex % LAYER_SURFACE_TINT.length];
}
