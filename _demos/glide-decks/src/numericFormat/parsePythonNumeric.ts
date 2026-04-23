import type { NumberFormatSpec, ParseIssue, ParseMode } from "./types";
import type { DialectParseCandidate } from "./types";

export interface PythonParseResult {
  ok: boolean;
  candidate?: DialectParseCandidate;
  errors?: ParseIssue[];
}

const ALIGN = new Set(["<", ">", "^", "="]);
const TYPE_CHARS = new Set(["d", "e", "E", "f", "F", "g", "G", "n", "%"]);

function issue(code: string, severity: "warning" | "error", message: string, recommendation?: string): ParseIssue {
  return { code, severity, message, recommendation };
}

function defaultSpec(): NumberFormatSpec {
  return {
    notation: "general",
    prefix: "",
    suffix: "",
    minIntegerDigits: 1,
    minFractionDigits: 0,
    maxFractionDigits: null,
    grouping: { kind: "none", size: 3 },
    scaleThousands: 0,
    percent: false,
    signPolicy: "negative-only",
    negativeStyle: "minus",
    emptyWhenZero: false,
  };
}

/**
 * Parse Python format specification (after brace normalization).
 */
export function parsePythonNumeric(body: string, mode: ParseMode, inheritedWarnings: ParseIssue[]): PythonParseResult {
  const errors: ParseIssue[] = [...inheritedWarnings];
  const repairs: ParseIssue[] = [];

  if (body === "") {
    return {
      ok: false,
      errors: [
        issue("INVALID_FORMAT", "error", "Empty Python format specification.", "Enter a format such as .2f or #,##0.00 via excel:"),
      ],
    };
  }

  let working = body;
  if ((working === ".e" || working === ".E") && mode === "lenient") {
    working = ".2e";
    repairs.push(
      issue(
        "PY_REPAIRED_MISSING_SCI_PRECISION",
        "warning",
        "Defaulted scientific precision to 2.",
        "Use .2e explicitly.",
      ),
    );
  }

  // Bare comma — grouping only
  if (body === ",") {
    const spec = defaultSpec();
    spec.notation = "general";
    spec.grouping = { kind: "comma", size: 3 };
    return {
      ok: true,
      errors: [],
      candidate: {
        dialect: "python",
        spec,
        normalizedBody: ",",
        score: 0,
        repairCount: 0,
        warnings: errors,
      },
    };
  }

  let s = working;
  let i = 0;

  let fillChar: string | null = null;
  let align: "left" | "right" | "center" | "after-sign" | null = null;
  let sign: "+" | "-" | " " | null = null;
  let zeroPadFlag = false;
  let width = 0;
  let widthDigits = "";
  let grouping: "comma" | "underscore" | null = null;
  let precisionStr = "";
  let typeChar: string | null = null;

  // [fill]align
  if (i + 1 < s.length && ALIGN.has(s[i + 1]!)) {
    fillChar = s[i]!;
    i += 2;
    align = mapAlign(s[i - 1]!);
  } else if (ALIGN.has(s[i]!)) {
    align = mapAlign(s[i]!);
    i += 1;
  }

  // sign
  if (i < s.length && (s[i] === "+" || s[i] === "-" || s[i] === " ")) {
    sign = s[i] as "+" | "-" | " ";
    i += 1;
  }

  // # alternate
  if (i < s.length && s[i] === "#") {
    i += 1;
  }

  // 0 leading zero pad + width (e.g. `05` → pad to width 5)
  if (i < s.length && s[i] === "0" && i + 1 < s.length && /\d/.test(s[i + 1]!)) {
    zeroPadFlag = true;
    i += 1;
  }

  // width
  while (i < s.length && /\d/.test(s[i]!)) {
    widthDigits += s[i]!;
    i += 1;
  }
  if (widthDigits) {
    width = parseInt(widthDigits, 10);
  }

  // z (rare in mini-language — skip if present per spec grammar mention)
  if (i < s.length && s[i] === "z") {
    i += 1;
  }

  // grouping
  if (i < s.length && (s[i] === "," || s[i] === "_")) {
    grouping = s[i] === "," ? "comma" : "underscore";
    i += 1;
  }

  // precision .digits
  if (i < s.length && s[i] === ".") {
    i += 1;
    while (i < s.length && /\d/.test(s[i]!)) {
      precisionStr += s[i]!;
      i += 1;
    }
    // lenient: .e without digits
    if (precisionStr === "" && i < s.length && (s[i] === "e" || s[i] === "E")) {
      if (mode === "lenient") {
        precisionStr = "2";
        repairs.push(
          issue(
            "PY_REPAIRED_MISSING_SCI_PRECISION",
            "warning",
            "Filled default precision for scientific format.",
            "Use .2e explicitly.",
          ),
        );
      } else {
        return {
          ok: false,
          errors: [
            issue("INVALID_FORMAT", "error", "Precision required before e/E in strict mode.", "Use .2e"),
            ...errors,
          ],
        };
      }
    }
  }

  // type
  if (i < s.length && TYPE_CHARS.has(s[i]!)) {
    typeChar = s[i]!;
    i += 1;
  }

  if (i < s.length) {
    return {
      ok: false,
      errors: [
        issue("INVALID_FORMAT", "error", `Unexpected Python format characters: "${s.slice(i)}".`),
        ...errors,
      ],
    };
  }

  // Empty precision with . only — error in strict
  if (working.includes(".") && precisionStr === "" && typeChar && !["e", "E"].includes(typeChar)) {
    const dotIdx = working.indexOf(".");
    const afterDot = body.slice(dotIdx + 1);
    if (!/^\d/.test(afterDot) && mode === "strict") {
      return {
        ok: false,
        errors: [issue("INVALID_FORMAT", "error", "Empty precision in strict mode."), ...errors],
      };
    }
  }

  const spec = defaultSpec();
  if (sign === "+") spec.signPolicy = "always";
  else if (sign === " ") spec.signPolicy = "space";

  if (grouping === "comma") spec.grouping = { kind: "comma", size: 3 };
  else if (grouping === "underscore") spec.grouping = { kind: "underscore", size: 3 };

  if (align) spec.align = align;
  if (fillChar) spec.fillChar = fillChar;
  if (width > 0) {
    spec.width = width;
    if (zeroPadFlag) {
      spec.zeroPaddingWidth = width;
    }
  }

  const prec = precisionStr ? parseInt(precisionStr, 10) : null;

  if (typeChar === "%") {
    spec.notation = "percent";
    spec.percent = true;
    if (prec !== null) {
      spec.minFractionDigits = prec;
      spec.maxFractionDigits = prec;
    }
  } else if (typeChar === "e" || typeChar === "E") {
    spec.notation = "scientific";
    if (prec !== null) {
      spec.minFractionDigits = prec;
      spec.maxFractionDigits = prec;
    } else if (mode === "lenient") {
      spec.minFractionDigits = 2;
      spec.maxFractionDigits = 2;
      repairs.push(
        issue(
          "PY_REPAIRED_MISSING_SCI_PRECISION",
          "warning",
          "Defaulted scientific precision to 2.",
          "Use .2e explicitly.",
        ),
      );
    } else {
      return {
        ok: false,
        errors: [issue("INVALID_FORMAT", "error", "Scientific format requires precision in strict mode.", "Use .2e"), ...errors],
      };
    }
  } else if (typeChar === "f" || typeChar === "F") {
    spec.notation = "fixed";
    if (prec !== null) {
      spec.minFractionDigits = prec;
      spec.maxFractionDigits = prec;
    }
  } else if (typeChar === "d") {
    spec.notation = "integer";
    spec.minIntegerDigits = prec ?? 1;
    spec.maxFractionDigits = 0;
  } else if (typeChar === "n") {
    spec.notation = "general";
    spec.grouping = { kind: "locale", size: 3 };
  } else if (typeChar === "g" || typeChar === "G") {
    spec.notation = "general";
    if (prec !== null) spec.significantDigits = prec;
  } else if (typeChar === null) {
    if (zeroPadFlag && width > 0) {
      spec.zeroPaddingWidth = width;
      spec.width = width;
      spec.align = spec.align ?? "after-sign";
      spec.notation = "general";
    } else if (widthDigits) {
      spec.width = width;
      spec.notation = "general";
    }
    // `.2` without type — general with precision (lenient)
    if (working.includes(".") && prec !== null && typeChar === null) {
      spec.notation = "general";
      spec.minFractionDigits = prec;
      spec.maxFractionDigits = prec;
      if (mode === "lenient") {
        repairs.push(
          issue(
            "LOW_CONFIDENCE_PARSE",
            "warning",
            "Numeric format uses precision without a type letter; interpreted as general.",
            "Prefer .2f or .2g explicitly.",
          ),
        );
      }
    }
  }

  const allWarnings = [...errors, ...repairs];

  const normalizedBody = canonicalPythonBody(working, spec, mode, repairs);

    return {
      ok: true,
      errors: [],
      candidate: {
        dialect: "python",
        spec,
        normalizedBody,
        score: 0,
        repairCount: repairs.length,
        warnings: allWarnings,
      },
    };
  }

function mapAlign(c: string): "left" | "right" | "center" | "after-sign" {
  if (c === "<") return "left";
  if (c === ">") return "right";
  if (c === "^") return "center";
  return "after-sign";
}

function canonicalPythonBody(original: string, spec: NumberFormatSpec, _mode: ParseMode, repairs: ParseIssue[]): string {
  if (/^0\d+$/.test(original) && !original.includes(".")) {
    return original;
  }
  if (original === ",") return ",";
  // Reconstruct minimal spec string from parsed (preserve intent)
  if (spec.notation === "percent" && spec.minFractionDigits >= 0) {
    return `.${spec.minFractionDigits}%`;
  }
  if (spec.notation === "scientific" && spec.minFractionDigits != null) {
    return `.${spec.minFractionDigits}e`;
  }
  if (spec.notation === "fixed" && spec.minFractionDigits != null) {
    return `.${spec.minFractionDigits}f`;
  }
  if (spec.grouping.kind === "comma" && spec.notation === "general" && original === ",") {
    return ",";
  }
  if (repairs.some((r) => r.code === "PY_REPAIRED_MISSING_SCI_PRECISION")) {
    return ".2e";
  }
  return original.replace(/^\{|\}$/g, "").replace(/^:/, "");
}
