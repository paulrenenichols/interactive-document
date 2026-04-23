import Papa from "papaparse";
import { medianLinear } from "../math";

export const HRIS_CSV_URL = "/input-data-files/hris-acme-technologies.csv";

export interface HrisRow {
  hrisId: string;
  businessTitle: string;
  displayTitle: string;
  jobLevel: string;
  jobLevelCombined: string;
  country: string;
  jobFamily: string;
  accountabilityCenter: string;
  locationDescr: string;
  startDate: string;
  tenure: string;
  startDateInCurrentRole: string;
  tenureInRole: string;
  tenureInRoleYearFrac: number | null;
  baseSalaryLocal: number | null;
  currencyType: string;
  bonusTarget: number | null;
  targetBonus: number | null;
  targetTotalCash: number | null;
  targetLti: number | null;
  targetTotalPay: number | null;
  peerHeadcount: number | null;
  peerMedianSalary: number | null;
  salaryVsPeerAverage: number | null;
  marketMedianSalary: number | null;
  marketImpliedCashBonus: number | null;
  marketImpliedLti: number | null;
  marketMedianTotalCash: number | null;
  marketMedianTotalPay: number | null;
  salaryVariance: number | null;
  totalCashVariance: number | null;
  totalPayVariance: number | null;
}

function stripCommas(s: string): string {
  return s.replace(/,/g, "").trim();
}

/** Parses currency / plain numeric cells that may use thousands separators */
function parseMoney(value: string | undefined): number | null {
  if (value == null || value === "") return null;
  const cleaned = stripCommas(value);
  if (cleaned === "" || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Parses values like "175%" or "12.5%" */
function parsePercent(value: string | undefined): number | null {
  if (value == null || value === "") return null;
  const m = String(value).trim().match(/^(-?[\d.]+)\s*%$/);
  if (m) {
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : null;
  }
  return parseMoney(value);
}

function parseNumber(value: string | undefined): number | null {
  if (value == null || value === "") return null;
  const cleaned = stripCommas(String(value));
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function mapRawRow(raw: Record<string, string>): HrisRow {
  return {
    hrisId: raw["HRIS ID"] ?? "",
    businessTitle: raw["Business Title"] ?? "",
    displayTitle: raw["Display Title"] ?? "",
    jobLevel: raw["Job Level"] ?? "",
    jobLevelCombined: raw["Job Level Combined"] ?? "",
    country: raw["Country"] ?? "",
    jobFamily: raw["Job Family"] ?? "",
    accountabilityCenter: raw["Accountability Center"] ?? "",
    locationDescr: raw["Location Descr"] ?? "",
    startDate: raw["Start Date"] ?? "",
    tenure: raw["Tenure"] ?? "",
    startDateInCurrentRole: raw["Start Date in Current Role"] ?? "",
    tenureInRole: raw["Tenure in Role"] ?? "",
    tenureInRoleYearFrac: parseNumber(raw["Tenure in Role Year Frac"]),
    baseSalaryLocal: parseMoney(raw["Base Salary (Local Currency)"]),
    currencyType: raw["Currency Type"] ?? "",
    bonusTarget: parsePercent(raw["Bonus Target"]),
    targetBonus: parseMoney(raw["Target Bonus"]),
    targetTotalCash: parseMoney(raw["Target Total Cash"]),
    targetLti: parseMoney(raw["Target LTI"]),
    targetTotalPay: parseMoney(raw["Target Total Pay"]),
    peerHeadcount: parseNumber(raw["Peer Headcount"]),
    peerMedianSalary: parseMoney(raw["Peer Median Salary"]),
    salaryVsPeerAverage: parseNumber(raw["Salary vs. Peer Average"]),
    marketMedianSalary: parseMoney(raw["Market Median Salary"]),
    marketImpliedCashBonus: parseMoney(raw["Market Implied Cash Bonus"]),
    marketImpliedLti: parseMoney(raw["Market Implied LTI"]),
    marketMedianTotalCash: parseMoney(raw["Market Median Total Cash"]),
    marketMedianTotalPay: parseMoney(raw["Market Median Total Pay"]),
    salaryVariance: parseNumber(raw["Salary Variance"]),
    totalCashVariance: parseNumber(raw["Total Cash Variance"]),
    totalPayVariance: parseNumber(raw["Total Pay Variance"]),
  };
}

export async function loadHrisCsv(url: string = HRIS_CSV_URL): Promise<HrisRow[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load HRIS CSV: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length > 0) {
    const fatal = parsed.errors.find((e) => e.type === "Quotes" || e.type === "FieldMismatch");
    if (fatal) {
      throw new Error(`CSV parse error: ${fatal.message}`);
    }
  }

  const rows = (parsed.data ?? [])
    .filter((row) => Object.keys(row).some((k) => row[k]?.trim() !== ""))
    .map((row) => mapRawRow(row));

  return rows;
}

export interface JobFamilyAggregate {
  jobFamily: string;
  headcount: number;
  sumTargetTotalPay: number;
  medianBaseSalary: number | null;
}

/** Aggregates for a bar chart: top job families by total comp spend */
export function aggregateCompSpendByJobFamily(
  rows: HrisRow[],
  limit = 14,
): JobFamilyAggregate[] {
  const byFamily = new Map<
    string,
    { sumPay: number; baseSalaries: number[]; count: number }
  >();

  for (const r of rows) {
    const key = r.jobFamily.trim() || "Unknown";
    let g = byFamily.get(key);
    if (!g) {
      g = { sumPay: 0, baseSalaries: [], count: 0 };
      byFamily.set(key, g);
    }
    g.count += 1;
    if (r.targetTotalPay != null) {
      g.sumPay += r.targetTotalPay;
    }
    if (r.baseSalaryLocal != null) {
      g.baseSalaries.push(r.baseSalaryLocal);
    }
  }

  const list: JobFamilyAggregate[] = [];
  for (const [jobFamily, g] of byFamily) {
    g.baseSalaries.sort((a, b) => a - b);
    list.push({
      jobFamily,
      headcount: g.count,
      sumTargetTotalPay: g.sumPay,
      medianBaseSalary: medianLinear(g.baseSalaries),
    });
  }

  return list
    .sort((a, b) => b.sumTargetTotalPay - a.sumTargetTotalPay)
    .slice(0, limit);
}
