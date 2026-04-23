import type { NumberFormatSpec, ParseIssue, ParseMode, SectionSpec } from "./types";
import type { DialectParseCandidate } from "./types";

export interface ExcelParseResult {
  ok: boolean;
  candidate?: DialectParseCandidate;
  errors?: ParseIssue[];
}

function issue(code: string, severity: "warning" | "error", message: string, recommendation?: string): ParseIssue {
  return { code, severity, message, recommendation };
}

/** Split Excel format on `;` outside quotes and escapes. */
export function splitExcelSections(s: string): string[] | null {
  const parts: string[] = [];
  let cur = "";
  let inQuote = false;
  let i = 0;
  while (i < s.length) {
    const c = s[i]!;
    if (!inQuote && c === "\\" && i + 1 < s.length) {
      cur += c + s[i + 1]!;
      i += 2;
      continue;
    }
    if (c === '"') {
      inQuote = !inQuote;
      cur += c;
      i += 1;
      continue;
    }
    if (c === ";" && !inQuote) {
      parts.push(cur);
      cur = "";
      i += 1;
      continue;
    }
    cur += c;
    i += 1;
  }
  parts.push(cur);
  if (inQuote) return null;
  if (parts.length > 4) return null;
  return parts;
}

/** Avoid matching literal `MM` suffix (millions) — only obvious date fragments */
const DATE_HINT = /\b(yyyy|dd\/mm\/|hh:mm|mm:ss|am\/pm)\b/i;

/** Rough guard: obvious date/time tokens outside quotes. */
function nonNumericExcelTokenError(unquotedScan: string): ParseIssue | null {
  if (DATE_HINT.test(unquotedScan)) {
    return issue(
      "NON_NUMERIC_EXCEL_TOKEN",
      "error",
      "Date or time tokens are not supported in numeric formats (v1).",
      "Quote literals or use a dedicated date format feature.",
    );
  }
  return null;
}

function stripQuotesForScan(section: string): string {
  let out = "";
  let inQ = false;
  for (let i = 0; i < section.length; i++) {
    const c = section[i]!;
    if (c === "\\" && !inQ && i + 1 < section.length) {
      out += section[i + 1]!;
      i++;
      continue;
    }
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (!inQ) out += c;
  }
  return out.replace(/\[[^\]]*\]/g, "");
}

function defaultSpec(): NumberFormatSpec {
  return {
    notation: "fixed",
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

export function parseExcelNumeric(body: string, mode: ParseMode): ExcelParseResult {
  const warnings: ParseIssue[] = [];

  const sections = splitExcelSections(body);
  if (sections === null) {
    return {
      ok: false,
      errors: [issue("UNBALANCED_QUOTES", "error", "Unbalanced quotes in Excel format.")],
    };
  }

  const scan = stripQuotesForScan(body);
  const dtErr = nonNumericExcelTokenError(scan);
  if (dtErr) {
    return { ok: false, errors: [dtErr] };
  }

  if (sections.length === 1) {
    const r = parseSingleExcelSection(sections[0]!, mode, warnings);
    if (!r.ok || !r.spec) {
      return { ok: false, errors: r.errors ?? [issue("INVALID_FORMAT", "error", "Invalid Excel numeric format.")] };
    }
    const normalized = r.canonicalString ?? `excel:${body}`;
    return {
      ok: true,
      errors: [],
      candidate: {
        dialect: "excel",
        spec: r.spec,
        normalizedBody: normalized.replace(/^excel:/, ""),
        score: 0,
        repairCount: r.repairCount ?? 0,
        warnings: [...warnings, ...(r.warnings ?? [])],
      },
    };
  }

  const sectionSpecs: SectionSpec[] = [];
  let repairCount = 0;
  const canonicalParts: string[] = [];

  const roles = sectionRoles(sections.length);

  for (let si = 0; si < sections.length; si++) {
    const sec = sections[si]!;
    const role = roles[si]!;
    if (role === "text") {
      // Fourth section — parse but ignore for numeric (spec: ignore for numeric input)
      sectionSpecs.push({
        role: "text",
        prefix: "",
        suffix: sec,
        minIntegerDigits: 0,
        minFractionDigits: 0,
        maxFractionDigits: null,
        grouping: { kind: "none", size: 3 },
        scaleThousands: 0,
        percent: false,
        scientific: false,
      });
      canonicalParts.push(sec);
      continue;
    }

    const r = parseSectionToSectionSpec(sec, role, mode);
    repairCount += r.repairCount;
    warnings.push(...r.warnings);
    sectionSpecs.push(r.section);
    canonicalParts.push(r.canonicalSection);
  }

  const spec: NumberFormatSpec = {
    ...defaultSpec(),
    notation: sectionSpecs.some((s) => s.percent) ? "percent" : "fixed",
    signPolicy: "section-based",
    negativeStyle: "section",
    prefix: "",
    suffix: "",
    sections: sectionSpecs,
    emptyWhenZero: sectionSpecs.some((s) => s.role === "zero" && s.emptyOutput),
  };

  if (sections.length >= 3) {
    const zeroSec = sectionSpecs.find((s) => s.role === "zero");
    if (zeroSec?.emptyOutput) {
      spec.emptyWhenZero = true;
    }
  }

  const normalizedBody = canonicalParts.join(";");
  return {
    ok: true,
    errors: [],
    candidate: {
      dialect: "excel",
      spec,
      normalizedBody,
      score: 0,
      repairCount,
      warnings,
    },
  };
}

function sectionRoles(n: number): SectionSpec["role"][] {
  if (n === 1) return ["positive"];
  if (n === 2) return ["positive", "negative"];
  if (n === 3) return ["positive", "negative", "zero"];
  return ["positive", "negative", "zero", "text"];
}

interface SingleParse {
  ok: boolean;
  spec?: NumberFormatSpec;
  errors?: ParseIssue[];
  warnings?: ParseIssue[];
  canonicalString?: string;
  repairCount?: number;
}

function parseSingleExcelSection(section: string, mode: ParseMode, outWarnings: ParseIssue[]): SingleParse {
  const r = parseSectionToSectionSpec(section, "positive", mode);
  outWarnings.push(...r.warnings);
  const spec = defaultSpec();
  const sec = r.section;
  spec.notation = sec.percent ? "percent" : sec.scientific ? "scientific" : "fixed";
  spec.prefix = sec.prefix;
  spec.suffix = sec.suffix;
  spec.minIntegerDigits = sec.minIntegerDigits;
  spec.minFractionDigits = sec.minFractionDigits;
  spec.maxFractionDigits = sec.maxFractionDigits;
  spec.grouping = sec.grouping;
  spec.scaleThousands = sec.scaleThousands;
  spec.percent = sec.percent;
  spec.signPolicy = "negative-only";
  spec.negativeStyle = "minus";
  spec.emptyWhenZero = false;
  if (sec.scientific) {
    spec.notation = "scientific";
    spec.scientificExponentDigits = sec.scientificExponentDigits ?? 2;
  }
  return {
    ok: true,
    spec,
    canonicalString: `excel:${r.canonicalSection}`,
    repairCount: r.repairCount,
  };
}

function parseSectionToSectionSpec(
  section: string,
  role: SectionSpec["role"],
  mode: ParseMode,
): {
  section: SectionSpec;
  canonicalSection: string;
  warnings: ParseIssue[];
  repairCount: number;
} {
  const warnings: ParseIssue[] = [];
  let repairCount = 0;

  // Extract bracket metadata and remove bracket tokens for placeholder walk (outside quotes)
  let bracketColor: string | null = null;
  let condition: string | null = null;
  const rest = stripBracketTokensOutsideQuotes(section, (inner) => {
    if (/^color/i.test(inner) || /^Red$/i.test(inner)) bracketColor = inner;
    else if (/^[<>=]/.test(inner)) condition = inner;
  });

  // Empty string section `""` (Excel empty output)
  const t = section.trim();
  if (t === '""' || (t === "" && role === "zero")) {
    return {
      section: {
        role,
        prefix: "",
        suffix: "",
        minIntegerDigits: 0,
        minFractionDigits: 0,
        maxFractionDigits: null,
        grouping: { kind: "none", size: 3 },
        scaleThousands: 0,
        percent: false,
        scientific: false,
        emptyOutput: role === "zero" && t === '""',
        color: bracketColor,
        condition,
      },
      canonicalSection: '""',
      warnings,
      repairCount,
    };
  }

  // Walk `rest` for placeholders, literals, percent, scientific
  let prefix = "";
  let i = 0;
  const s = rest;
  // Skip leading literals until 0 # ?
  while (i < s.length && !"0#?".includes(s[i]!)) {
    if (s[i] === '"') {
      const end = s.indexOf('"', i + 1);
      if (end === -1) break;
      prefix += s.slice(i, end + 1);
      i = end + 1;
      continue;
    }
    if (s[i] === "\\" && i + 1 < s.length) {
      prefix += s[i + 1]!;
      i += 2;
      continue;
    }
    prefix += s[i]!;
    i += 1;
  }

  // Integer part: groups of (#,)* and 0#?
  let intPart = "";
  let hasGroupComma = false;
  while (i < s.length) {
    const c = s[i]!;
    if ("0#?".includes(c)) {
      intPart += c;
      i += 1;
      continue;
    }
    if (c === "," && i + 1 < s.length && "0#?".includes(s[i + 1]!)) {
      hasGroupComma = true;
      intPart += c;
      i += 1;
      continue;
    }
    break;
  }

  let fracPart = "";
  let minInt = 0;
  let maxFrac: number | null = null;
  let minFrac = 0;
  if (i < s.length && s[i] === ".") {
    i += 1;
    while (i < s.length && "0#?".includes(s[i]!)) {
      fracPart += s[i]!;
      i += 1;
    }
  }

  // Count 0 in int and frac
  minInt = (intPart.match(/0/g) || []).length;
  if (minInt === 0) minInt = (intPart.match(/#/g) || []).length ? 1 : 0;
  if (minInt === 0 && intPart.includes("#")) minInt = 1;

  minFrac = (fracPart.match(/0/g) || []).length;
  const hashFrac = (fracPart.match(/#/g) || []).length;
  maxFrac = minFrac > 0 || hashFrac > 0 ? Math.max(minFrac, hashFrac || minFrac) : fracPart.length > 0 ? minFrac : null;
  if (maxFrac === 0 && fracPart.length) maxFrac = 0;

  // Scaling commas after number pattern
  let scaleThousands = 0;
  while (i < s.length && s[i] === ",") {
    scaleThousands += 1;
    i += 1;
  }

  let percent = false;
  if (i < s.length && s[i] === "%") {
    percent = true;
    i += 1;
  }

  // Scientific E+00
  let scientific = false;
  let sciExpDigits: number | null = null;
  if (i < s.length && (s[i] === "e" || s[i] === "E")) {
    scientific = true;
    i += 1;
    if (i < s.length && (s[i] === "+" || s[i] === "-")) i += 1;
    let zs = "";
    while (i < s.length && s[i] === "0") {
      zs += s[i]!;
      i += 1;
    }
    sciExpDigits = zs.length || 2;
  }

  // Suffix: rest (may need quoting)
  let suffix = s.slice(i);
  let canonicalSuffix = suffix;
  if (suffix.length > 0 && !suffix.trim().startsWith('"')) {
    const lit = suffix.replace(/^[,]*/, "");
    if (lit.length > 0 && /^[A-Za-z]+$/.test(lit) && mode === "lenient") {
      canonicalSuffix = `"${lit}"`;
      warnings.push(
        issue(
          "XL_LITERAL_CANONICALIZED",
          "warning",
          `Quoted literal suffix "${lit}" for canonical Excel form.`,
          `Use excel:${canonicalSuffix}`,
        ),
      );
      repairCount += 1;
    }
  }

  const groupingKind = hasGroupComma ? "comma" : "none";

  const sec: SectionSpec = {
    role,
    prefix: unescapeExcelLiteral(prefix),
    suffix: unescapeExcelLiteral(suffix),
    minIntegerDigits: Math.max(1, minInt || (intPart.length ? 1 : 0)),
    minFractionDigits: minFrac,
    maxFractionDigits: maxFrac,
    grouping: { kind: groupingKind, size: 3 },
    scaleThousands,
    percent,
    scientific,
    scientificExponentDigits: sciExpDigits,
    color: bracketColor,
    condition,
  };

  const rebuilt =
    prefix +
    intPart +
    (fracPart.length ? "." + fracPart : "") +
    ",".repeat(scaleThousands) +
    (percent ? "%" : "") +
    (scientific ? `E+${"0".repeat(sciExpDigits ?? 2)}` : "") +
    canonicalSuffix;

  return {
    section: sec,
    canonicalSection: rebuilt,
    warnings,
    repairCount,
  };
}

function stripBracketTokensOutsideQuotes(
  section: string,
  onInner: (inner: string) => void,
): string {
  let out = "";
  let i = 0;
  while (i < section.length) {
    const c = section[i]!;
    if (c === '"') {
      const end = section.indexOf('"', i + 1);
      if (end === -1) {
        out += c;
        i++;
        continue;
      }
      out += section.slice(i, end + 1);
      i = end + 1;
      continue;
    }
    if (c === "[") {
      const j = section.indexOf("]", i);
      if (j === -1) {
        out += c;
        i++;
        continue;
      }
      onInner(section.slice(i + 1, j));
      i = j + 1;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function unescapeExcelLiteral(s: string): string {
  return s.replace(/\\(.)/g, "$1").replace(/"([^"]*)"/g, "$1");
}
