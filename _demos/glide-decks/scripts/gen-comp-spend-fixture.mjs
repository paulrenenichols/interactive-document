/**
 * One-off: regenerate src/fixtures/compSpendByJobFamilyChart.json from the HRIS CSV.
 * Run: node scripts/gen-comp-spend-fixture.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Papa from "papaparse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const csvPath = path.join(root, "public", "input-data-files", "hris-acme-technologies.csv");
const outPath = path.join(root, "src", "fixtures", "compSpendByJobFamilyChart.json");

function stripCommas(s) {
  return s.replace(/,/g, "").trim();
}

function parseMoney(value) {
  if (value == null || value === "") return null;
  const cleaned = stripCommas(value);
  if (cleaned === "" || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function medianLinear(sorted) {
  const n = sorted.length;
  if (n === 0) return null;
  if (n === 1) return sorted[0];
  const rank = 0.5 * (n - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (rank - lo) * (sorted[hi] - sorted[lo]);
}

const text = fs.readFileSync(csvPath, "utf8");
const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim() });
const rows = parsed.data.filter((row) => Object.keys(row).some((k) => row[k]?.trim() !== ""));

const byFamily = new Map();

for (const raw of rows) {
  const jobFamily = (raw["Job Family"] ?? "").trim() || "Unknown";
  let g = byFamily.get(jobFamily);
  if (!g) {
    g = { sumPay: 0, baseSalaries: [], count: 0 };
    byFamily.set(jobFamily, g);
  }
  g.count += 1;
  const pay = parseMoney(raw["Target Total Pay"]);
  if (pay != null) g.sumPay += pay;
  const base = parseMoney(raw["Base Salary (Local Currency)"]);
  if (base != null) g.baseSalaries.push(base);
}

const list = [];
for (const [jobFamily, g] of byFamily) {
  g.baseSalaries.sort((a, b) => a - b);
  list.push({
    jobFamily,
    headcount: g.count,
    sumTargetTotalPay: g.sumPay,
    medianBaseSalary: medianLinear(g.baseSalaries),
  });
}

list.sort((a, b) => b.sumTargetTotalPay - a.sumTargetTotalPay);
const top = list.slice(0, 14);

fs.writeFileSync(outPath, JSON.stringify(top, null, 2) + "\n", "utf8");
console.log("Wrote", outPath, top.length, "rows");
