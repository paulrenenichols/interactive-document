import type { DataSeriesAssetRow } from "../types/dataModel";

const MAX_OPTIONS = 50;

export interface ActiveMention {
  mentionStart: number;
  cursorPos: number;
  query: string;
}

/** Active @mention from the last `@` before `cursorPos`, per plan rules. */
export function parseMentionAtCursor(value: string, cursorPos: number): ActiveMention | null {
  const safe = Math.max(0, Math.min(cursorPos, value.length));
  const at = value.slice(0, safe).lastIndexOf("@");
  if (at < 0) return null;
  const segment = value.slice(at, safe);
  if (segment.includes("\n") || segment.includes("]")) return null;
  return { mentionStart: at, cursorPos: safe, query: segment.slice(1) };
}

export function applyMention(
  value: string,
  mentionStart: number,
  cursorPos: number,
  seriesName: string,
): string {
  return value.slice(0, mentionStart) + "[" + seriesName + "]" + value.slice(cursorPos);
}

export function filterAndSortSeries(rows: DataSeriesAssetRow[], query: string): DataSeriesAssetRow[] {
  const q = query.trim().toLowerCase();
  let list: DataSeriesAssetRow[];
  if (!q) {
    list = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    return list.slice(0, MAX_OPTIONS);
  }
  list = rows.filter((r) => r.name.toLowerCase().includes(q));
  list.sort((a, b) => {
    const an = a.name.toLowerCase();
    const bn = b.name.toLowerCase();
    const ap = an.startsWith(q) ? 0 : 1;
    const bp = bn.startsWith(q) ? 0 : 1;
    if (ap !== bp) return ap - bp;
    return a.name.localeCompare(b.name);
  });
  return list.slice(0, MAX_OPTIONS);
}
