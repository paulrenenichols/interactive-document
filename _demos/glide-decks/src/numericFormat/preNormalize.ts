import type { ParseIssue, ParseMode } from "./types";

export type ExplicitDialect = "excel" | "python" | null;

export interface PreNormalizeResult {
  trimmed: string;
  explicitDialect: ExplicitDialect;
  /** Body after stripping explicit `excel:` / `python:` / `py:` */
  bodyForExcel: string;
  /** Body for Python parser (wrapper stripped, inner normalized) */
  bodyForPython: string;
  wrapperWarnings: ParseIssue[];
  /** True if `rest` after prefix was a single `{…}` field (scoring / PY_WRAPPER_NORMALIZED). */
  pythonHadBraceWrapper: boolean;
}

const PREFIX_EXCEL = /^excel:/i;
const PREFIX_PYTHON = /^python:/i;
const PREFIX_PY = /^py:/i;

/**
 * If the entire string is one `{...}` replacement field, unwrap and optionally strip leading `:`.
 */
export function normalizePythonBraces(raw: string, mode: ParseMode): { inner: string; warnings: ParseIssue[] } {
  const warnings: ParseIssue[] = [];
  const t = raw.trim();
  if (t.length < 2 || t[0] !== "{" || t[t.length - 1] !== "}") {
    return { inner: raw, warnings };
  }
  // Count braces — only unwrap if single top-level pair
  let depth = 0;
  let firstInner = -1;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === "{") {
      if (depth === 0) firstInner = i;
      depth++;
    } else if (t[i] === "}") {
      depth--;
      if (depth === 0 && i !== t.length - 1) {
        return { inner: raw, warnings };
      }
    }
  }
  if (depth !== 0 || firstInner !== 0) {
    return { inner: raw, warnings };
  }
  let inner = t.slice(1, -1);
  if (inner.startsWith(":")) {
    inner = inner.slice(1);
    if (mode === "lenient" || inner.length > 0) {
      warnings.push({
        code: "PY_WRAPPER_NORMALIZED",
        severity: "warning",
        message: "Normalized Python brace wrapper (leading colon removed).",
      });
    }
  } else if (inner.length > 0) {
    warnings.push({
      code: "PY_WRAPPER_NORMALIZED",
      severity: "warning",
      message: "Normalized Python brace wrapper.",
    });
  }
  return { inner, warnings };
}

export function preNormalize(input: string, mode: ParseMode): PreNormalizeResult {
  const trimmed = input.trim();
  let explicitDialect: ExplicitDialect = null;
  let rest = trimmed;

  if (PREFIX_EXCEL.test(rest)) {
    explicitDialect = "excel";
    rest = rest.replace(PREFIX_EXCEL, "");
  } else if (PREFIX_PYTHON.test(rest)) {
    explicitDialect = "python";
    rest = rest.replace(PREFIX_PYTHON, "");
  } else if (PREFIX_PY.test(rest)) {
    explicitDialect = "python";
    rest = rest.replace(PREFIX_PY, "");
  }

  const bodyForExcel = rest;

  const pythonHadBraceWrapper = /^\{[\s\S]*\}$/.test(rest.trim());
  const brace = normalizePythonBraces(rest, mode);
  const bodyForPython = brace.inner;
  const wrapperWarnings = brace.warnings;

  return {
    trimmed,
    explicitDialect,
    bodyForExcel,
    bodyForPython,
    wrapperWarnings,
    pythonHadBraceWrapper,
  };
}
