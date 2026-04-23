/**
 * Regenerate src/fixtures/maskIsTechnologySeed.json from the HRIS CSV.
 * 1 = Tech Designation === "T", else 0. Row order matches csvColumnImport / tenure seed.
 * Run: node scripts/gen-mask-is-technology-seed.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Papa from "papaparse";

const EXPECTED_ROW_COUNT = 796;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const csvPath = path.join(root, "public", "input-data-files", "hris-acme-technologies.csv");
const outPath = path.join(root, "src", "fixtures", "maskIsTechnologySeed.json");

const text = fs.readFileSync(csvPath, "utf8");
const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim() });
const rows = parsed.data.filter((row) => Object.keys(row).some((k) => row[k]?.trim() !== ""));

const out = rows.map((raw) =>
  (raw["Tech Designation"] ?? "").trim() === "T" ? "1" : "0",
);

if (out.length !== EXPECTED_ROW_COUNT) {
  console.error(
    `Expected ${EXPECTED_ROW_COUNT} data rows after filtering, got ${out.length}. Update EXPECTED_ROW_COUNT or CSV parsing.`,
  );
  process.exit(1);
}

fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log("Wrote", outPath, out.length, "values");
