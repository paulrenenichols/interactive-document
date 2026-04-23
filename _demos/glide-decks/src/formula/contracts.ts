/**
 * Semantic formula contracts (see design/semantic-series-charting-spec.md §6).
 * Binary `=` is equality; optional leading `=` is normalized before parse (§6.2).
 */

export type GrainKind = "scalar" | "row" | "index";

/** Inferred or declared primitive type for validation. */
export type FormulaValueType = "numeric" | "text" | "boolean" | "date" | "json" | "unknown";

export type ExprNode =
  | { kind: "literal"; value: string | number | boolean | null }
  | { kind: "series_ref"; name: string; seriesId?: string }
  | { kind: "unary"; op: string; arg: ExprNode }
  | { kind: "binary"; op: string; left: ExprNode; right: ExprNode }
  | { kind: "call"; fn: string; args: ExprNode[]; kwargs: Record<string, ExprNode> };

export const FORMULA_VERSION = 1 as const;

/** Per-node validation annotation (§6.2). */
export interface NodeAnnotation {
  valueType: FormulaValueType;
  grainKind: GrainKind;
  /** Dataset import lineage for row-grain; undefined if unknown. */
  rootDatasetImportId?: string | null;
  /** For index-grain alignment checks. */
  alignedIndexId?: string | null;
  nullable: boolean;
  errorCodes: DiagnosticCode[];
}

export type DiagnosticSeverity = "error" | "warning";

export type DiagnosticCode =
  | "parse_error"
  | "unknown_series"
  | "unknown_function"
  | "bad_arity"
  | "bad_kwarg"
  | "where_grain"
  | "grain_mismatch"
  | "lineage_mismatch"
  | "index_alignment"
  | "not_implemented_eval";

export interface Diagnostic {
  code: DiagnosticCode;
  severity: DiagnosticSeverity;
  message: string;
  /** Byte offset into normalized formula string when available. */
  offset?: number;
}

export interface SeriesSemanticMeta {
  id?: string;
  name: string;
  valueType: FormulaValueType;
  grainKind: GrainKind;
  rootDatasetImportId?: string | null;
  alignedIndexId?: string | null;
  /** Row-grain series that defines index membership (for INDEX / _BY). */
  indexSourceSeriesId?: string | null;
  /** Display name of the source column when `id` resolution is not wired. */
  indexSourceSeriesName?: string | null;
  roleKind?: string;
}

export interface FormulaValidationContext {
  /** Resolve display names (as in `[Name]`) to semantics. */
  seriesByName: Map<string, SeriesSemanticMeta>;
}

export interface AnnotatedExprNode {
  node: ExprNode;
  ann: NodeAnnotation;
  children?: AnnotatedExprNode[];
}

export interface ValidationResult {
  root: AnnotatedExprNode | null;
  diagnostics: Diagnostic[];
  /** References to other series by display name (for dependencies). */
  referencedSeriesNames: string[];
}

/** Parameter descriptor for the function registry. */
export interface ParamSpec {
  name: string;
  optional?: boolean;
  /** If true, this kw-only param is the `where=` filter. */
  isWhere?: boolean;
}

export interface FunctionSpec {
  fn: string;
  params: ParamSpec[];
  outputGrain: GrainKind;
  /** If true, function bridges row and index (e.g. *_BY). */
  bridgesGrain?: boolean;
  /** Evaluation implemented in evaluateFormula.ts */
  evalImpl?: "full" | "stub";
}

/** Single source of truth for linter and runtime dispatch (§6.4). */
export const FUNCTION_REGISTRY: Record<string, FunctionSpec> = {
  INDEX: {
    fn: "INDEX",
    params: [
      { name: "source" },
      { name: "order", optional: true },
      { name: "blanks", optional: true },
    ],
    outputGrain: "index",
    evalImpl: "stub",
  },
  FILTER_INDEX: {
    fn: "FILTER_INDEX",
    params: [{ name: "index" }, { name: "keep" }],
    outputGrain: "index",
    evalImpl: "stub",
  },
  SORT_INDEX: {
    fn: "SORT_INDEX",
    params: [{ name: "index" }, { name: "by" }, { name: "order", optional: true }],
    outputGrain: "index",
    evalImpl: "stub",
  },
  SUM: {
    fn: "SUM",
    params: [{ name: "values" }, { name: "where", optional: true, isWhere: true }],
    outputGrain: "scalar",
    evalImpl: "full",
  },
  AVG: {
    fn: "AVG",
    params: [{ name: "values" }, { name: "where", optional: true, isWhere: true }],
    outputGrain: "scalar",
    evalImpl: "full",
  },
  MEDIAN: {
    fn: "MEDIAN",
    params: [{ name: "values" }, { name: "where", optional: true, isWhere: true }],
    outputGrain: "scalar",
    evalImpl: "full",
  },
  PERCENTILE: {
    fn: "PERCENTILE",
    params: [
      { name: "values" },
      { name: "p" },
      { name: "where", optional: true, isWhere: true },
    ],
    outputGrain: "scalar",
    evalImpl: "full",
  },
  MIN: {
    fn: "MIN",
    params: [{ name: "values" }, { name: "where", optional: true, isWhere: true }],
    outputGrain: "scalar",
    evalImpl: "full",
  },
  MAX: {
    fn: "MAX",
    params: [{ name: "values" }, { name: "where", optional: true, isWhere: true }],
    outputGrain: "scalar",
    evalImpl: "full",
  },
  COUNT: {
    fn: "COUNT",
    params: [{ name: "values" }, { name: "where", optional: true, isWhere: true }],
    outputGrain: "scalar",
    evalImpl: "full",
  },
  COUNT_ROWS: {
    fn: "COUNT_ROWS",
    params: [{ name: "where", optional: true, isWhere: true }],
    outputGrain: "scalar",
    evalImpl: "full",
  },
  LEN: {
    fn: "LEN",
    params: [{ name: "series" }],
    outputGrain: "scalar",
    evalImpl: "full",
  },
  SUM_BY: {
    fn: "SUM_BY",
    params: [
      { name: "values" },
      { name: "index" },
      { name: "where", optional: true, isWhere: true },
    ],
    outputGrain: "index",
    bridgesGrain: true,
    evalImpl: "full",
  },
  AVG_BY: {
    fn: "AVG_BY",
    params: [
      { name: "values" },
      { name: "index" },
      { name: "where", optional: true, isWhere: true },
    ],
    outputGrain: "index",
    bridgesGrain: true,
    evalImpl: "full",
  },
  MEDIAN_BY: {
    fn: "MEDIAN_BY",
    params: [
      { name: "values" },
      { name: "index" },
      { name: "where", optional: true, isWhere: true },
    ],
    outputGrain: "index",
    bridgesGrain: true,
    evalImpl: "full",
  },
  PERCENTILE_BY: {
    fn: "PERCENTILE_BY",
    params: [
      { name: "values" },
      { name: "index" },
      { name: "p" },
      { name: "where", optional: true, isWhere: true },
    ],
    outputGrain: "index",
    bridgesGrain: true,
    evalImpl: "full",
  },
  MIN_BY: {
    fn: "MIN_BY",
    params: [
      { name: "values" },
      { name: "index" },
      { name: "where", optional: true, isWhere: true },
    ],
    outputGrain: "index",
    bridgesGrain: true,
    evalImpl: "full",
  },
  MAX_BY: {
    fn: "MAX_BY",
    params: [
      { name: "values" },
      { name: "index" },
      { name: "where", optional: true, isWhere: true },
    ],
    outputGrain: "index",
    bridgesGrain: true,
    evalImpl: "full",
  },
  COUNT_BY: {
    fn: "COUNT_BY",
    params: [{ name: "index" }, { name: "where", optional: true, isWhere: true }],
    outputGrain: "index",
    bridgesGrain: true,
    evalImpl: "full",
  },
  IF: {
    fn: "IF",
    params: [{ name: "condition" }, { name: "trueExpr" }, { name: "falseExpr" }],
    outputGrain: "scalar", // refined by validator
    evalImpl: "full",
  },
  AND: {
    fn: "AND",
    params: [{ name: "values" }], // variadic: multiple args
    outputGrain: "scalar",
    evalImpl: "full",
  },
  OR: {
    fn: "OR",
    params: [{ name: "values" }],
    outputGrain: "scalar",
    evalImpl: "full",
  },
  NOT: {
    fn: "NOT",
    params: [{ name: "value" }],
    outputGrain: "scalar",
    evalImpl: "full",
  },
  IN: {
    fn: "IN",
    params: [{ name: "value" }, { name: "options" }],
    outputGrain: "scalar",
    evalImpl: "full",
  },
  COALESCE: {
    fn: "COALESCE",
    params: [{ name: "values" }],
    outputGrain: "scalar",
    evalImpl: "full",
  },
  ISBLANK: {
    fn: "ISBLANK",
    params: [{ name: "value" }],
    outputGrain: "scalar",
    evalImpl: "full",
  },
  CONCAT: {
    fn: "CONCAT",
    params: [{ name: "values" }],
    outputGrain: "scalar",
    evalImpl: "full",
  },
};

/** Precedence: higher number = tighter binding. */
export const BINARY_PRECEDENCE: Record<string, number> = {
  "^": 60,
  "*": 50,
  "/": 50,
  "+": 40,
  "-": 40,
  "&": 30,
  "=": 20,
  "!=": 20,
  "<": 20,
  ">": 20,
  "<=": 20,
  ">=": 20,
};

export function normalizeLeadingEquals(input: string): string {
  const s = input.trimStart();
  if (s.startsWith("=")) return s.slice(1).trimStart();
  return input.trimStart();
}

export function getFunctionSpec(name: string): FunctionSpec | undefined {
  return FUNCTION_REGISTRY[name.toUpperCase()];
}
