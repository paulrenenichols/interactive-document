/**
 * Integer draft helpers for text fields that allow empty / partial typing (e.g. "-")
 * before commit on blur. Used with {@link useDebouncedNumericDraft}.
 */

export function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Strip invalid characters; keep at most one leading minus when allowNegative. */
export function filterIntegerDraftInput(raw: string, allowNegative: boolean): string {
  if (!allowNegative) {
    return raw.replace(/\D/g, "");
  }
  const withoutExtra = raw.replace(/[^\d-]/g, "");
  if (withoutExtra === "" || withoutExtra === "-") {
    return withoutExtra;
  }
  const neg = withoutExtra.startsWith("-");
  const digits = withoutExtra.replace(/-/g, "");
  if (!neg) return digits;
  return digits === "" ? "-" : `-${digits}`;
}

/**
 * Returns a finite integer in [min, max] if `s` is a complete decimal integer string
 * (not a lone "-"). Otherwise null — no debounced preview for partial drafts.
 */
export function parseCompleteIntegerInRange(
  s: string,
  min: number,
  max: number,
  allowNegative: boolean,
): number | null {
  const t = s.trim();
  if (t === "") return null;
  if (allowNegative && t === "-") return null;
  const pattern = allowNegative ? /^-?\d+$/ : /^\d+$/;
  if (!pattern.test(t)) return null;
  const n = parseInt(t, 10);
  if (!Number.isFinite(n)) return null;
  if (n < min || n > max) return null;
  return n;
}

/**
 * Blur commit: empty or invalid drafts become defaultValue, then clamp to [min, max].
 */
export function commitIntegerDraft(
  s: string,
  min: number,
  max: number,
  defaultValue: number,
  allowNegative: boolean,
): number {
  const t = s.trim();
  if (t === "" || (allowNegative && t === "-")) {
    return clampInt(defaultValue, min, max);
  }
  const pattern = allowNegative ? /^-?\d+$/ : /^\d+$/;
  if (!pattern.test(t)) {
    return clampInt(defaultValue, min, max);
  }
  const n = parseInt(t, 10);
  if (!Number.isFinite(n)) {
    return clampInt(defaultValue, min, max);
  }
  return clampInt(n, min, max);
}
