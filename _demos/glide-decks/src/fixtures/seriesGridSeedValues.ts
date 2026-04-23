import type { DataSeriesAssetRow } from "../types/dataModel";
import maskIsTechnologySeed from "./maskIsTechnologySeed.json";
import tenureInRoleYearFracSeed from "./tenureInRoleYearFracSeed.json";

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

/** Catalog names for the numeric series sourced from `Tenure in Role Year Frac` in the HRIS CSV. */
const TENURE_IN_ROLE_YEAR_FRAC_SERIES_NAMES = new Set(["Tenure in Role", "Tenure in Role Yrs"]);

/** Row-grain mask fixture: 0/1 from Tech Designation === "T" in hris-acme-technologies.csv. */
const MASK_IS_TECHNOLOGY_SERIES_NAME = "mask.Is Technology?";

/**
 * Builds initial cell values for the grid editor from catalog metadata.
 * Deterministic so drops feel stable across sessions.
 */
export function buildSeedValuesForSeries(row: DataSeriesAssetRow): string[] {
  const n = Math.min(row.length, MAX_SEED_ROWS);
  const vt = row.value_type.toLowerCase();

  if (
    vt === "numeric" &&
    row.origin_kind === "imported" &&
    TENURE_IN_ROLE_YEAR_FRAC_SERIES_NAMES.has(row.name)
  ) {
    const seed = tenureInRoleYearFracSeed as readonly string[];
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      out.push(seed[i] ?? "");
    }
    return out;
  }

  if (
    vt === "numeric" &&
    row.origin_kind === "formula" &&
    row.role_kind === "mask" &&
    row.name === MASK_IS_TECHNOLOGY_SERIES_NAME
  ) {
    const seed = maskIsTechnologySeed as readonly string[];
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      out.push(seed[i] ?? "");
    }
    return out;
  }

  const out: string[] = [];
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
