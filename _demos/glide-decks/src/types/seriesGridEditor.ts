import type { DataSeriesAssetRow, OriginKind, RoleKind, ValueType } from "./dataModel";

/** Persisted baseline for dirty comparison (name + cell values). */
export interface SeriesGridSavedSnapshot {
  name: string;
  values: string[];
  /** Saved formula text for formula series; omitted for non-formula columns. */
  rawFormula?: string;
  /**
   * Mirrors {@link SeriesGridColumnState.displayNameSource} for dirty detection after save.
   * Omitted means legacy columns (treated as user-confirmed for naming).
   */
  displayNameSource?: DisplayNameSource;
}

/** `auto_placeholder`: name from "New Formula NN" until the user edits the name field. */
export type DisplayNameSource = "auto_placeholder" | "user_locked";

/** One open series column in the grid editor. */
export interface SeriesGridColumnState {
  instanceId: string;
  catalogSeriesName: string;
  draftName: string;
  origin_kind: OriginKind;
  role_kind: RoleKind;
  value_type: ValueType;
  draftValues: string[];
  /** Draft formula text when `origin_kind === "formula"`; otherwise unused. */
  draftRawFormula: string;
  /**
   * Whether the display name is still auto-generated (LLM may rename later) or user-edited (locked).
   */
  displayNameSource: DisplayNameSource;
  savedSnapshot: SeriesGridSavedSnapshot;
}

export function createColumnStateFromCatalog(row: DataSeriesAssetRow, seedValues: string[]): SeriesGridColumnState {
  const name = row.name;
  const values = seedValues.slice();
  const isFormula = row.origin_kind === "formula";
  const rawFormula = isFormula ? (row.raw_formula ?? "") : "";
  const displayNameSource: DisplayNameSource =
    row.series_display_name_source === "auto" ? "auto_placeholder" : "user_locked";
  return {
    instanceId: crypto.randomUUID(),
    catalogSeriesName: name,
    draftName: name,
    origin_kind: row.origin_kind,
    role_kind: row.role_kind,
    value_type: row.value_type,
    draftValues: values,
    draftRawFormula: rawFormula,
    displayNameSource,
    savedSnapshot: {
      name,
      values: values.slice(),
      displayNameSource,
      ...(isFormula ? { rawFormula } : {}),
    },
  };
}

export function isDraftDirty(col: SeriesGridColumnState): boolean {
  if (!snapshotsEqual(col.savedSnapshot, col.draftName, col.draftValues)) return true;
  if ((col.savedSnapshot.displayNameSource ?? "user_locked") !== col.displayNameSource) return true;
  if (col.origin_kind === "formula") {
    return (col.savedSnapshot.rawFormula ?? "") !== col.draftRawFormula;
  }
  return false;
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

/** @internal */
export function displayNameSourceToPersisted(source: DisplayNameSource): "auto" | "user" {
  return source === "auto_placeholder" ? "auto" : "user";
}

/**
 * After save, `DataSeriesAssetRow.name` may differ from the column's bootstrap `catalogSeriesName`.
 * When it does, grid state must adopt the persisted name so @-mention dedupe and `availableSeries` lookups stay aligned.
 */
export function catalogRenameToApplyAfterSave(
  catalogSeriesNameBefore: string,
  persistedName: string,
): string | undefined {
  return catalogSeriesNameBefore !== persistedName ? persistedName : undefined;
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
