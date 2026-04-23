import { arbitrate } from "./arbitrate";
import { withExcelPrefix, withPythonPrefix } from "./canonicalize";
import { parseExcelNumeric } from "./parseExcelNumeric";
import { parsePythonNumeric } from "./parsePythonNumeric";
import { preNormalize } from "./preNormalize";
import { computeDialectScore } from "./score";
import type { DialectParseCandidate, ParseIssue, ParseMode, ParseResult, RequestedDialect } from "./types";

export interface ParseNumericFormatOptions {
  dialect?: RequestedDialect;
  mode?: ParseMode;
}

const DEFAULT_MODE: ParseMode = "lenient";

function err(code: string, message: string, recommendation?: string): ParseIssue {
  return { code, severity: "error", message, recommendation };
}

function warn(code: string, message: string, recommendation?: string): ParseIssue {
  return { code, severity: "warning", message, recommendation };
}

/**
 * Parse and optionally arbitrate Excel vs Python numeric format strings.
 * @see taxonomy-and-data-covenants/numeric-format-input-schema.md
 */
export function parseNumericFormat(input: string, options?: ParseNumericFormatOptions): ParseResult {
  const requestedDialect: RequestedDialect = options?.dialect ?? "auto";
  const mode: ParseMode = options?.mode ?? DEFAULT_MODE;

  const originalInput = input;
  const pn = preNormalize(input, mode);
  const effectiveRequested: RequestedDialect =
    pn.explicitDialect === "excel" || pn.explicitDialect === "python" ? pn.explicitDialect : requestedDialect;

  const explicitPrefix = pn.explicitDialect != null;

  let excelCandidate: DialectParseCandidate | null = null;
  let pythonCandidate: DialectParseCandidate | null = null;

  if (effectiveRequested === "auto" || effectiveRequested === "excel") {
    const xr = parseExcelNumeric(pn.bodyForExcel, mode);
    if (xr.ok && xr.candidate) {
      const c = xr.candidate;
      const score = computeDialectScore({
        originalTrimmed: pn.trimmed,
        bodyForDialect: pn.bodyForExcel,
        dialect: "excel",
        explicitPrefix,
        hadFullPythonBraces: false,
        repairCount: c.repairCount,
        parseFailed: false,
      });
      excelCandidate = { ...c, score };
    }
  }

  if (effectiveRequested === "auto" || effectiveRequested === "python") {
    const pr = parsePythonNumeric(pn.bodyForPython, mode, pn.wrapperWarnings);
    if (pr.ok && pr.candidate) {
      const c = pr.candidate;
      const score = computeDialectScore({
        originalTrimmed: pn.trimmed,
        bodyForDialect: pn.bodyForPython,
        dialect: "python",
        explicitPrefix,
        hadFullPythonBraces: pn.pythonHadBraceWrapper,
        repairCount: c.repairCount,
        parseFailed: false,
      });
      pythonCandidate = { ...c, score };
    }
  }

  if (effectiveRequested === "excel" && !excelCandidate) {
    const xr = parseExcelNumeric(pn.bodyForExcel, mode);
    return {
      originalInput,
      requestedDialect,
      mode,
      detectedDialect: "invalid",
      confidence: 0,
      warnings: [],
      errors: (xr.errors?.length ? xr.errors : [err("INVALID_FORMAT", "error", "Invalid Excel numeric format.")]),
    };
  }

  if (effectiveRequested === "python" && !pythonCandidate) {
    const pr = parsePythonNumeric(pn.bodyForPython, mode, pn.wrapperWarnings);
    return {
      originalInput,
      requestedDialect,
      mode,
      detectedDialect: "invalid",
      confidence: 0,
      warnings: [],
      errors: (pr.errors?.length ? pr.errors : [err("INVALID_FORMAT", "error", "Invalid Python numeric format.")]),
    };
  }

  if (excelCandidate && !pythonCandidate) {
    return buildSuccess(originalInput, requestedDialect, mode, excelCandidate, "excel", explicitPrefix);
  }
  if (pythonCandidate && !excelCandidate) {
    return buildSuccess(originalInput, requestedDialect, mode, pythonCandidate, "python", explicitPrefix);
  }

  if (!excelCandidate && !pythonCandidate) {
    const xr = parseExcelNumeric(pn.bodyForExcel, mode);
    const pr = parsePythonNumeric(pn.bodyForPython, mode, pn.wrapperWarnings);
    const merged = [...(xr.errors ?? []), ...(pr.errors ?? [])];
    return {
      originalInput,
      requestedDialect,
      mode,
      detectedDialect: "invalid",
      confidence: 0,
      warnings: [],
      errors:
        merged.length > 0
          ? merged
          : [err("INVALID_FORMAT", "error", "Could not parse as Excel or Python numeric format.")],
    };
  }

  const outcome = arbitrate(excelCandidate!, pythonCandidate!);
  if (outcome.kind === "winner") {
    const d: "excel" | "python" = outcome.candidate.dialect;
    return buildSuccess(originalInput, requestedDialect, mode, outcome.candidate, d, explicitPrefix);
  }

  if (outcome.kind === "ambiguous") {
    const a = outcome.a;
    const b = outcome.b;
    return {
      originalInput,
      requestedDialect,
      mode,
      detectedDialect: "ambiguous",
      confidence: Math.min(a.score, b.score),
      warnings: [
        warn(
          "AMBIGUOUS_DIALECT",
          "Both Excel and Python interpretations are plausible.",
          `Try explicit prefix: ${withExcelPrefix(a.normalizedBody)} or ${withPythonPrefix(b.normalizedBody)}`,
        ),
      ],
      errors: [],
    };
  }

  return {
    originalInput,
    requestedDialect,
    mode,
    detectedDialect: "invalid",
    confidence: 0,
    warnings: [],
    errors: [err("INVALID_FORMAT", "error", "Could not parse numeric format.")],
  };
}

function buildSuccess(
  originalInput: string,
  requestedDialect: RequestedDialect,
  mode: ParseMode,
  candidate: DialectParseCandidate,
  which: "excel" | "python",
  explicitPrefix: boolean,
): ParseResult {
  const normalizedExternal =
    which === "excel" ? withExcelPrefix(candidate.normalizedBody) : withPythonPrefix(candidate.normalizedBody);

  const warnings = [...candidate.warnings];
  if (!explicitPrefix && candidate.repairCount > 0) {
    warnings.push(
      warn(
        "LOW_CONFIDENCE_PARSE",
        "Format was normalized or repaired; prefer an explicit excel: or python: prefix when saving.",
        normalizedExternal,
      ),
    );
  }

  return {
    originalInput,
    requestedDialect,
    mode,
    detectedDialect: which,
    confidence: candidate.score,
    normalizedExternal,
    canonical: candidate.spec,
    warnings,
    errors: [],
  };
}

/** True if save should be blocked (any error-level issue). */
export function isAcceptableForSave(result: ParseResult): boolean {
  return result.errors.length === 0 && result.detectedDialect !== "invalid" && result.detectedDialect !== "ambiguous";
}

/** True if save allowed but dialect was ambiguous (user may want to disambiguate). */
export function isAmbiguous(result: ParseResult): boolean {
  return result.detectedDialect === "ambiguous";
}
