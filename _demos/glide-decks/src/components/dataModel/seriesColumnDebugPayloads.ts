import type { SeriesGridColumnState } from "../../types/seriesGridEditor";

/** Column state without per-cell arrays; counts summarize value lengths. */
export function buildSeriesMetadataDebugPayload(col: SeriesGridColumnState) {
  const { draftValues, savedSnapshot, ...rest } = col;
  return {
    ...rest,
    draftValueCount: draftValues.length,
    savedValueCount: savedSnapshot.values.length,
    savedSnapshot: {
      name: savedSnapshot.name,
      rawFormula: savedSnapshot.rawFormula,
      displayNameSource: savedSnapshot.displayNameSource,
    },
  };
}

/**
 * `draftValues` is live grid editor state; `savedSnapshotValues` is the last-saved baseline (dirty checks).
 */
export function buildSeriesValuesDebugPayload(col: SeriesGridColumnState) {
  return {
    catalogSeriesName: col.catalogSeriesName,
    draftName: col.draftName,
    valueCount: col.draftValues.length,
    draftValues: col.draftValues,
    savedSnapshotValues: col.savedSnapshot.values,
  };
}
