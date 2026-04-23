import { formatSampleValue } from "./formatSample";
import { parseNumericFormat } from "./parseNumericFormat";
import { resolveNumericFormat } from "./resolve";

/**
 * Formats a numeric axis tick using the same resolution rules as series cells:
 * validated override wins, else bound series `numeric_format`.
 */
export function formatAxisTickNumber(
  value: number,
  args: { override: string | null; seriesCanonical: string | null },
): string {
  const resolved = resolveNumericFormat({
    override: args.override,
    seriesCanonical: args.seriesCanonical,
  });
  if (!resolved) {
    return String(value);
  }
  const p = parseNumericFormat(resolved, { dialect: "auto", mode: "lenient" });
  if (p.errors.length > 0 || !p.canonical) {
    return String(value);
  }
  return formatSampleValue(value, p.canonical);
}
