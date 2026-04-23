import { parseNumericFormat } from "./parseNumericFormat";

/** Future chart design: per-slot or axis canonical format strings (`excel:…` / `python:…`). */
export type ChartNumericFormatOverrides = Partial<Record<string, string>>;

export interface ResolveNumericFormatArgs {
  /** Canonical format from series metadata, if any. */
  seriesCanonical?: string | null;
  /** Chart-level override (canonical string). */
  override?: string | null;
}

/**
 * Resolve display format: validated override wins, else series default.
 */
export function resolveNumericFormat(args: ResolveNumericFormatArgs): string | null {
  const o = args.override?.trim();
  if (o) {
    const p = parseNumericFormat(o, { dialect: "auto", mode: "lenient" });
    if (p.errors.length === 0 && p.normalizedExternal) {
      return p.normalizedExternal;
    }
  }
  const s = args.seriesCanonical?.trim();
  if (s) {
    const p = parseNumericFormat(s, { dialect: "auto", mode: "lenient" });
    if (p.errors.length === 0 && p.normalizedExternal) {
      return p.normalizedExternal;
    }
  }
  return null;
}
