import type { DataSeriesAssetRow, OriginKind, ValueType } from "./dataModel";

/** Persisted baseline for dirty comparison (name + cell values). */
export interface SeriesGridSavedSnapshot {
  name: string;
  values: string[];
}

/** One open series column in the grid editor. */
export interface SeriesGridColumnState {
  instanceId: string;
  catalogSeriesName: string;
  draftName: string;
  origin_kind: OriginKind;
  value_type: ValueType;
  draftValues: string[];
  savedSnapshot: SeriesGridSavedSnapshot;
}

export function createColumnStateFromCatalog(row: DataSeriesAssetRow, seedValues: string[]): SeriesGridColumnState {
  const name = row.name;
  const values = seedValues.slice();
  return {
    instanceId: crypto.randomUUID(),
    catalogSeriesName: name,
    draftName: name,
    origin_kind: row.origin_kind,
    value_type: row.value_type,
    draftValues: values,
    savedSnapshot: { name, values: values.slice() },
  };
}

export function isDraftDirty(col: SeriesGridColumnState): boolean {
  return !snapshotsEqual(col.savedSnapshot, col.draftName, col.draftValues);
}

/** Values-only dirty check (for use when draft name is held in local UI state). */
export function isValuesDirty(col: SeriesGridColumnState): boolean {
  const s = col.savedSnapshot.values;
  const d = col.draftValues;
  if (s.length !== d.length) return true;
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== d[i]) return true;
  }
  return false;
}

/**
 * Whether a proposed display name is unique among global catalog series and other open grid columns.
 * `catalogSeriesName` is the dropped asset identity; its catalog row may be renamed away.
 */
export function isSeriesDisplayNameValid(
  proposedName: string,
  catalogSeriesName: string,
  availableSeries: { name: string }[],
  openColumns: SeriesGridColumnState[],
  instanceId: string,
): boolean {
  const n = proposedName.trim();
  if (!n) return false;
  const conflictCatalog = availableSeries.some((r) => r.name === n && r.name !== catalogSeriesName);
  if (conflictCatalog) return false;
  const conflictOpen = openColumns.some(
    (c) => c.instanceId !== instanceId && c.draftName.trim() === n,
  );
  return !conflictOpen;
}

function snapshotsEqual(saved: SeriesGridSavedSnapshot, draftName: string, draftValues: string[]): boolean {
  if (saved.name !== draftName) return false;
  if (saved.values.length !== draftValues.length) return false;
  for (let i = 0; i < saved.values.length; i++) {
    if (saved.values[i] !== draftValues[i]) return false;
  }
  return true;
}

/** Placeholder "Enter value…" only for null/'' — not whitespace-only strings. */
export function showManualCellPlaceholder(value: string | undefined): boolean {
  return value == null || value === "";
}

export function maxRowCount(columns: SeriesGridColumnState[]): number {
  let m = 0;
  for (const c of columns) {
    if (c.draftValues.length > m) m = c.draftValues.length;
  }
  return m;
}

export function cellValueAt(col: SeriesGridColumnState, rowIndex: number): string {
  return col.draftValues[rowIndex] ?? "";
}
