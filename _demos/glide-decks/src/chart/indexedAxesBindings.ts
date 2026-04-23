import type {
  ChartBindingsState,
  IndexedAxesConfig,
  IndexedLayerRow,
  LayerAxisAssignment,
} from "../types/chartBindings";
import type { ChartCreationKind } from "../types/dataModel";

export const RECHARTS_X_AXIS_PRIMARY = "xPrimary";
export const RECHARTS_X_AXIS_SECONDARY = "xSecondary";
export const RECHARTS_Y_AXIS_PRIMARY = "yPrimary";
export const RECHARTS_Y_AXIS_SECONDARY = "ySecondary";

/** Chart kinds that may use optional secondary X/Y Cartesian axes. */
export function chartKindSupportsIndexedSecondaryAxes(kind: ChartCreationKind): boolean {
  return kind === "scatter" || kind === "bubble" || kind === "line_2d";
}

function defaultAssignment(): LayerAxisAssignment {
  return { x: "primary", y: "primary" };
}

export function normalizeIndexedAxesConfig(
  layersLength: number,
  indexedAxes: IndexedAxesConfig | undefined,
): IndexedAxesConfig {
  const secondaryX = indexedAxes?.secondaryX ?? false;
  const secondaryY = indexedAxes?.secondaryY ?? false;
  const layerAssignments: LayerAxisAssignment[] = Array.from({ length: layersLength }, (_, i) => {
    const a = indexedAxes?.layerAssignments?.[i];
    return {
      x: a?.x ?? "primary",
      y: a?.y ?? "primary",
    };
  });
  let clamped = layerAssignments.map((a) => ({ ...a }));
  if (!secondaryX) {
    clamped = clamped.map((a) => ({ ...a, x: "primary" as const }));
  }
  if (!secondaryY) {
    clamped = clamped.map((a) => ({ ...a, y: "primary" as const }));
  }
  return { secondaryX, secondaryY, layerAssignments: clamped };
}

export function syncIndexedLayers(
  prev: Extract<ChartBindingsState, { mode: "indexed_layers" }>,
  nextLayers: IndexedLayerRow[],
): Extract<ChartBindingsState, { mode: "indexed_layers" }> {
  const prevNorm = normalizeIndexedAxesConfig(prev.layers.length, prev.indexedAxes);
  const nextAssignments = Array.from({ length: nextLayers.length }, (_, i) => {
    const a = prevNorm.layerAssignments[i];
    return a ?? defaultAssignment();
  });
  return {
    mode: "indexed_layers",
    layers: nextLayers,
    indexedAxes: {
      secondaryX: prevNorm.secondaryX,
      secondaryY: prevNorm.secondaryY,
      layerAssignments: nextAssignments,
    },
  };
}

export function setIndexedSecondaryAxes(
  prev: Extract<ChartBindingsState, { mode: "indexed_layers" }>,
  patch: { secondaryX?: boolean; secondaryY?: boolean },
): Extract<ChartBindingsState, { mode: "indexed_layers" }> {
  const prevNorm = normalizeIndexedAxesConfig(prev.layers.length, prev.indexedAxes);
  const secondaryX = patch.secondaryX ?? prevNorm.secondaryX;
  const secondaryY = patch.secondaryY ?? prevNorm.secondaryY;
  let layerAssignments = prevNorm.layerAssignments.map((a) => ({ ...a }));
  if (!secondaryX) {
    layerAssignments = layerAssignments.map((a) => ({ ...a, x: "primary" as const }));
  }
  if (!secondaryY) {
    layerAssignments = layerAssignments.map((a) => ({ ...a, y: "primary" as const }));
  }
  return {
    mode: "indexed_layers",
    layers: prev.layers,
    indexedAxes: { secondaryX, secondaryY, layerAssignments },
  };
}

export function setLayerAxisAssignmentAt(
  prev: Extract<ChartBindingsState, { mode: "indexed_layers" }>,
  layerIndex: number,
  assignment: Partial<LayerAxisAssignment>,
): Extract<ChartBindingsState, { mode: "indexed_layers" }> {
  const prevNorm = normalizeIndexedAxesConfig(prev.layers.length, prev.indexedAxes);
  const layerAssignments = prevNorm.layerAssignments.map((a, i) => {
    if (i !== layerIndex) return a;
    let x = assignment.x ?? a.x;
    let y = assignment.y ?? a.y;
    if (!prevNorm.secondaryX) x = "primary";
    if (!prevNorm.secondaryY) y = "primary";
    return { x, y };
  });
  return {
    mode: "indexed_layers",
    layers: prev.layers,
    indexedAxes: {
      secondaryX: prevNorm.secondaryX,
      secondaryY: prevNorm.secondaryY,
      layerAssignments,
    },
  };
}

export function toRechartsAxisIds(
  assignment: LayerAxisAssignment,
  secondaryXEnabled: boolean,
  secondaryYEnabled: boolean,
): { xAxisId: string; yAxisId: string } {
  const xAxisId =
    secondaryXEnabled && assignment.x === "secondary" ? RECHARTS_X_AXIS_SECONDARY : RECHARTS_X_AXIS_PRIMARY;
  const yAxisId =
    secondaryYEnabled && assignment.y === "secondary" ? RECHARTS_Y_AXIS_SECONDARY : RECHARTS_Y_AXIS_PRIMARY;
  return { xAxisId, yAxisId };
}
