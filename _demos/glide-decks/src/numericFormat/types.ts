/** Aligned with taxonomy-and-data-covenants/numeric-format-input-schema.md */

export type Dialect = "excel" | "python" | "ambiguous" | "invalid";

export type ParseMode = "strict" | "lenient";

export type Notation = "integer" | "fixed" | "scientific" | "general" | "percent";

export type GroupingKind = "none" | "comma" | "underscore" | "locale";

export type SignPolicy = "negative-only" | "always" | "space" | "section-based";

export type NegativeStyle = "minus" | "parentheses" | "section" | "none";

export interface ParseIssue {
  code: string;
  severity: "warning" | "error";
  message: string;
  recommendation?: string;
}

export interface SectionSpec {
  role: "positive" | "negative" | "zero" | "text" | "conditional";
  prefix: string;
  suffix: string;
  minIntegerDigits: number;
  minFractionDigits: number;
  maxFractionDigits: number | null;
  grouping: {
    kind: GroupingKind;
    size: number;
  };
  scaleThousands: number;
  percent: boolean;
  scientific: boolean;
  scientificExponentDigits?: number | null;
  negativeStyle?: NegativeStyle;
  emptyOutput?: boolean;
  condition?: string | null;
  color?: string | null;
}

export interface NumberFormatSpec {
  notation: Notation;
  prefix: string;
  suffix: string;
  minIntegerDigits: number;
  minFractionDigits: number;
  maxFractionDigits: number | null;
  significantDigits?: number | null;
  grouping: {
    kind: GroupingKind;
    size: number;
  };
  scaleThousands: number;
  percent: boolean;
  signPolicy: SignPolicy;
  negativeStyle: NegativeStyle;
  scientificExponentDigits?: number | null;
  zeroPaddingWidth?: number | null;
  width?: number | null;
  align?: "left" | "right" | "center" | "after-sign" | null;
  fillChar?: string | null;
  emptyWhenZero: boolean;
  sections?: SectionSpec[];
  dialectSpecific?: Record<string, unknown>;
}

export interface ParseResult {
  originalInput: string;
  requestedDialect: "auto" | "excel" | "python";
  mode: ParseMode;
  detectedDialect: Dialect;
  confidence: number;
  normalizedExternal?: string;
  canonical?: NumberFormatSpec;
  warnings: ParseIssue[];
  errors: ParseIssue[];
}

/** Internal: one successful dialect parse before arbitration */
export interface DialectParseCandidate {
  dialect: "excel" | "python";
  spec: NumberFormatSpec;
  normalizedBody: string;
  score: number;
  repairCount: number;
  warnings: ParseIssue[];
}

export type RequestedDialect = "auto" | "excel" | "python";

export interface ParseNumericFormatOptions {
  dialect?: RequestedDialect;
  mode?: ParseMode;
}
