import { MARGIN } from "./score";
import type { DialectParseCandidate } from "./types";

export type ArbitrateOutcome =
  | { kind: "winner"; candidate: DialectParseCandidate }
  | { kind: "ambiguous"; a: DialectParseCandidate; b: DialectParseCandidate }
  | { kind: "none" };

export function arbitrate(
  excel: DialectParseCandidate | null,
  python: DialectParseCandidate | null,
): ArbitrateOutcome {
  if (excel && !python) return { kind: "winner", candidate: excel };
  if (python && !excel) return { kind: "winner", candidate: python };
  if (!excel && !python) return { kind: "none" };

  const a = excel!;
  const b = python!;
  const hi = a.score >= b.score ? a : b;
  const lo = a.score >= b.score ? b : a;
  const gap = Math.abs(hi.score - lo.score);

  if (gap >= MARGIN) {
    return { kind: "winner", candidate: hi };
  }

  if (hi.repairCount === 0 && lo.repairCount > 0) {
    return { kind: "winner", candidate: hi };
  }
  if (lo.repairCount === 0 && hi.repairCount > 0) {
    return { kind: "winner", candidate: lo };
  }

  return { kind: "ambiguous", a: hi, b: lo };
}
