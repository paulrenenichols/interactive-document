import type { DataSeriesAssetRow } from "../types/dataModel";

const SAMPLE_JOB_FAMILIES = [
  "Engineering",
  "Sales",
  "Operations",
  "Finance",
  "HR",
  "Legal",
  "Marketing",
  "Support",
];

/** Upper bound to keep demo memory reasonable; real app streams or pages. */
const MAX_SEED_ROWS = 2500;

/**
 * Builds initial cell values for the grid editor from catalog metadata.
 * Deterministic so drops feel stable across sessions.
 */
export function buildSeedValuesForSeries(row: DataSeriesAssetRow): string[] {
  const n = Math.min(row.length, MAX_SEED_ROWS);
  const out: string[] = [];
  const vt = row.value_type.toLowerCase();

  for (let i = 0; i < n; i++) {
    if (row.origin_kind === "manual") {
      out.push("");
      continue;
    }
    if (vt === "numeric") {
      if (row.origin_kind === "formula") {
        out.push((120_000 + i * 1_247.5).toFixed(2));
      } else {
        out.push(String(85_000 + (i * 17) % 40_000));
      }
      continue;
    }
    if (vt === "boolean") {
      out.push(i % 2 === 0 ? "true" : "false");
      continue;
    }
    if (vt === "date") {
      const d = new Date(Date.UTC(2020, 0, 1 + i));
      out.push(d.toISOString().slice(0, 10));
      continue;
    }
    // text and fallbacks
    const fam = SAMPLE_JOB_FAMILIES[i % SAMPLE_JOB_FAMILIES.length];
    out.push(`${fam} · ${i + 1}`);
  }

  return out;
}
