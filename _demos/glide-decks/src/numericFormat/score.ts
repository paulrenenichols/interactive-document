import type { DialectParseCandidate } from "./types";

export interface ScoreInput {
  originalTrimmed: string;
  bodyForDialect: string;
  dialect: "excel" | "python";
  explicitPrefix: boolean;
  hadFullPythonBraces: boolean;
  repairCount: number;
  parseFailed: boolean;
}

const MARGIN = 25;

export { MARGIN };

/** Weighted signals per numeric-format-input-schema.md §Suggested scoring model */
export function computeDialectScore(inp: ScoreInput): number {
  if (inp.parseFailed) return -100;

  let score = 0;
  const s = inp.bodyForDialect;

  if (inp.explicitPrefix) score += 100;
  if (inp.hadFullPythonBraces && inp.dialect === "python") score += 40;

  if (inp.dialect === "excel") {
    if (/;/.test(s) && !/^\{/.test(inp.originalTrimmed)) score += 35;
    if (/"[^"]*"/.test(s)) score += 30;
    if (/\[[^\]]+\]/.test(s)) score += 30;
    if (/\$\s*#/.test(s) || /#\s*,\s*#/.test(s)) score += 15;
    if (/E[+-]0+/i.test(s)) score += 15;
    if (/0#?[.,]*,+$/.test(s) || /[0#?][0#?.,]*,,+/.test(s)) score += 20;
  } else {
    if (/^\.\d+[fFeEgG%]/.test(s) || /^,\.\d/.test(s)) score += 25;
    if (/^[<>^=]/.test(s) || /^\d+$/.test(s) && s.length > 1 && s.startsWith("0")) score += 20;
    if (s === ",") score += 30;
    if (/^0\d+$/.test(s)) score += 20;
  }

  score -= inp.repairCount * 20;
  return score;
}

export function scoreGap(a: DialectParseCandidate, b: DialectParseCandidate): number {
  return Math.abs(a.score - b.score);
}
