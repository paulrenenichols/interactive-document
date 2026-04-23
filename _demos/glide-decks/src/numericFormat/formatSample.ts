import type { NumberFormatSpec, SectionSpec } from "./types";

/** Suggested preview values from numeric-format-input-schema.md §Suggested preview values */
export const PREVIEW_SAMPLE_VALUES: number[] = [
  65,
  56999999,
  0.342,
  0,
  3.14159,
  10000000,
  0.75413,
  1234567.89,
  -42.5,
];

function padLeft(s: string, len: number, ch: string): string {
  return s.length >= len ? s : ch.repeat(len - s.length) + s;
}

function addThousandsComma(intDigits: string, size: number): string {
  const neg = intDigits.startsWith("-");
  const d = neg ? intDigits.slice(1) : intDigits;
  const rev = d.split("").reverse();
  const out: string[] = [];
  for (let i = 0; i < rev.length; i++) {
    if (i > 0 && i % size === 0) out.push(",");
    out.push(rev[i]!);
  }
  return (neg ? "-" : "") + out.reverse().join("");
}

function formatSectionSimple(value: number, sec: SectionSpec): string {
  if (sec.emptyOutput && value === 0) return "";

  let x = value;
  for (let k = 0; k < sec.scaleThousands; k++) x /= 1000;
  if (sec.percent) x *= 100;

  const d = sec.maxFractionDigits ?? sec.minFractionDigits;

  if (sec.scientific) {
    return sec.prefix + x.toExponential(sec.scientificExponentDigits ?? 2) + sec.suffix;
  }

  const n = Math.abs(x).toFixed(d);
  return sec.prefix + n + sec.suffix;
}

function pickSection(value: number, spec: NumberFormatSpec): SectionSpec | null {
  const secs = spec.sections;
  if (!secs?.length) return null;
  const neg = value < 0;
  const zero = value === 0;
  if (secs.length === 1) return secs[0]!;
  if (secs.length === 2) return neg ? secs[1]! : secs[0]!;
  if (secs.length >= 3) {
    if (neg) return secs[1]!;
    if (zero) return secs[2]!;
    return secs[0]!;
  }
  return secs[0]!;
}

/**
 * Minimal v1 formatter for UI preview.
 */
export function formatSampleValue(value: number, spec: NumberFormatSpec): string {
  if (spec.emptyWhenZero && value === 0) {
    return "";
  }

  const sec = pickSection(value, spec);
  if (spec.sections && spec.sections.length > 0 && sec) {
    return formatSectionSimple(value, sec);
  }

  let v = value;
  for (let k = 0; k < spec.scaleThousands; k++) {
    v /= 1000;
  }

  if (spec.notation === "percent" && spec.percent) {
    v *= 100;
    const d = spec.maxFractionDigits ?? spec.minFractionDigits;
    return spec.prefix + v.toFixed(d) + "%" + spec.suffix;
  }

  if (spec.notation === "scientific") {
    return spec.prefix + v.toExponential(spec.scientificExponentDigits ?? 2) + spec.suffix;
  }

  if (spec.zeroPaddingWidth != null && spec.zeroPaddingWidth > 0) {
    const n = Math.round(Math.abs(value));
    const pad = padLeft(String(n), spec.zeroPaddingWidth, "0");
    return (value < 0 ? "-" : "") + pad;
  }

  const d = spec.maxFractionDigits ?? spec.minFractionDigits;
  let s = Math.abs(v).toFixed(d);
  if (spec.grouping.kind === "comma") {
    const [w, f] = s.split(".");
    s = addThousandsComma(w ?? "0", spec.grouping.size) + (d > 0 && f != null ? "." + f : "");
  }
  const num = (v < 0 ? "-" : "") + s;
  return spec.prefix + num + spec.suffix;
}
