import type { IndexSortOrder } from "../types/dataModel";

/**
 * Unique non-empty trimmed labels in an order suitable for index materialization.
 * Matches {@link SeriesIndexProperties} preview ordering for ascending/descending/custom.
 */
export function orderedUniqueLabelsForIndex(
  values: readonly string[],
  sortOrder: IndexSortOrder,
  customOrderText?: string,
): string[] {
  const uniq = [...new Set(values.map((s) => s.trim()).filter((s) => s !== ""))].sort((a, b) =>
    a.localeCompare(b),
  );
  if (sortOrder === "descending") return [...uniq].reverse();
  if (sortOrder === "custom") return orderUniquesByCustomText(uniq, customOrderText ?? "");
  return uniq;
}

/** Tokens from custom text (lines or commas); unknown labels are skipped; remaining uniques append in ascending order. */
function orderUniquesByCustomText(uniqSortedAscending: string[], customOrderText: string): string[] {
  const uniqSet = new Set(uniqSortedAscending);
  const tokens = customOrderText
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter((s) => s !== "");
  const out: string[] = [];
  const seen = new Set<string>();
  for (const t of tokens) {
    if (uniqSet.has(t) && !seen.has(t)) {
      out.push(t);
      seen.add(t);
    }
  }
  for (const u of uniqSortedAscending) {
    if (!seen.has(u)) out.push(u);
  }
  return out;
}

/**
 * One row per distinct source label, ordered like {@link orderedUniqueLabelsForIndex}
 * (same grain as {@link SeriesIndexProperties} preview).
 */
export function materializeUniqueIndexFromSourceValues(
  values: readonly string[],
  sortOrder: IndexSortOrder,
  customOrderText?: string,
): { length: number; values: string[] } {
  const labels = orderedUniqueLabelsForIndex(values, sortOrder, customOrderText);
  return {
    length: labels.length,
    values: labels.slice(),
  };
}

export function materializeUniqueIndexFromMap(
  sourceColumn: string,
  valuesBySeriesName: ReadonlyMap<string, readonly string[]>,
  sortOrder: IndexSortOrder = "ascending",
  customOrderText?: string,
): { length: number; values: string[] } {
  const col = valuesBySeriesName.get(sourceColumn);
  if (!col || col.length === 0) return { length: 0, values: [] };
  return materializeUniqueIndexFromSourceValues(col, sortOrder, customOrderText);
}
