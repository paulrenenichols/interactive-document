# Numeric Format Input Schema

## Goal

Define a single input contract for numeric formatting strings that may come from either:

- Excel custom number formats (numeric subset)
- Python format-spec mini-language inputs, including brace-wrapped user shorthand

The parser should accept the majority of common inputs from BI analysts, Excel users, and software engineers, then:

1. auto-detect the source dialect when not explicitly provided,
2. normalize the input into a canonical internal representation,
3. preserve the original user input,
4. flag ambiguous or colliding syntax,
5. produce actionable warnings and recommendations.

This document is written for human review and for downstream use by an AI code-generation system.

---

## Recommended product behavior

Use a two-layer contract:

1. **Flexible entry**: accept either raw Excel-like or raw Python-like strings.
2. **Explicit storage**: once parsed, store an explicit canonical form with a dialect prefix and a normalized AST.

Recommended canonical external forms:

```text
excel:$#,##0.0
excel:0.0,,"MM"
excel:+0%;-0%;0%
excel:0;-0;""
python:.2f
python:,
python:.2%
python:.2e
python:05
```

This allows a forgiving user experience at input time while eliminating ambiguity after save/load.

---

## Scope

### In scope for v1

- integers
- fixed decimals
- thousands separators
- scaling by trailing commas in Excel
- percent formatting
- scientific notation
- sign handling
- zero padding
- simple literal prefixes and suffixes
- Excel multi-section numeric formats using `;`
- Python raw specs like `.2f`, `,`, `.2%`, `05`
- Python brace-wrapped shorthand like `{.2f}`, `{,}`, `{05}`
- Canonical Python replacement-field form like `{:,.2f}`

### Out of scope for v1

- Excel date/time formats
- Excel elapsed time formats
- Excel text placeholder behavior with `@`
- full Excel color rendering
- full Excel conditional rendering beyond parse-and-preserve
- localized format-token variants where decimal/grouping tokens differ from `.` and `,`
- Python field names and conversions such as `{value:.2f}` or `{x!r:.2f}`
- old printf-style strings such as `%0.2f`

Notes:

- Excel conditions and color tokens in brackets may be preserved as dialect-specific metadata even if rendering support is deferred.
- If the input contains obvious date/time tokens outside quotes, the parser should reject it as non-numeric rather than guessing.


---

## Input contract

### Preferred API shape

```json
{
  "format": "0.0,,\"MM\"",
  "dialect": "auto",
  "mode": "lenient"
}
```

Where:

- `format` is the user-supplied string.
- `dialect` is one of `auto`, `excel`, `python`.
- `mode` is one of `strict`, `lenient`.

### Single-string convenience form

Allow a single string with an optional explicit prefix:

```text
<format-input> ::= [ <dialect-prefix> ] <format-body>
<dialect-prefix> ::= "excel:" | "python:" | "py:"
```

Examples:

```text
excel:$#,##0.0
python:.2f
py:{05}
0.0,,"MM"
{.2%}
```

### Recommendation

- For UI input, default to `dialect=auto` and `mode=lenient`.
- For saved configuration, persist `dialect` explicitly and also persist the normalized AST.
- For API callers, encourage explicit `dialect` whenever possible.

---

## Accepted source dialects

### Excel-style numeric subset

Supported patterns include:

- digit placeholders: `0`, `#`, `?`
- decimal point: `.`
- grouping and scaling comma: `,`
- semicolon sections: `positive;negative;zero;text`
- quoted literals: `"text"`
- escaped literals: `\\x`
- percent: `%`
- scientific notation markers like `E+00` or `E-00`
- bracket tokens such as `[Red]` or `[<=100]` as preserved metadata
- literal prefixes/suffixes such as `$`, `+`, `-`, parentheses

Examples:

```text
$#,##0.0
0.0,,"MM"
+0%;-0%;0%
0;-0;""
0.00E+00
```

### Excel section rules

When numeric input is rendered:

- 1 section: apply it to positive, negative, and zero values.
- 2 sections: section 1 applies to positive and zero; section 2 applies to negative.
- 3 sections: positive; negative; zero.
- 4 sections: positive; negative; zero; text. The fourth section should be parsed but ignored for numeric input.

---

### Python-style numeric subset

Supported inputs may appear as either a raw spec or a single brace-wrapped replacement field.

Accepted forms:

```text
.2f
,
.2%
05
{.2f}
{,}
{:,.2f}
```

### Tolerant Python rules

To match real user behavior, accept the following in `lenient` mode:

- a brace-wrapped spec without a leading `:` inside the braces
- a raw spec without braces
- common shorthand such as `{05}`

Normalization examples:

```text
{.2f}     -> python:.2f
{,}       -> python:,
{:05}     -> python:05
{05}      -> python:05
```



---

## Recommended internal schema

Parse all accepted inputs into a shared internal representation.

```ts
type Dialect = "excel" | "python" | "ambiguous" | "invalid";
type ParseMode = "strict" | "lenient";

type Notation = "integer" | "fixed" | "scientific" | "general" | "percent";
type GroupingKind = "none" | "comma" | "underscore" | "locale";
type SignPolicy = "negative-only" | "always" | "space" | "section-based";
type NegativeStyle = "minus" | "parentheses" | "section" | "none";

interface ParseIssue {
  code: string;
  severity: "warning" | "error";
  message: string;
  recommendation?: string;
}

interface SectionSpec {
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

interface NumberFormatSpec {
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
  zeroPaddingWidth?: number | null;
  width?: number | null;
  align?: "left" | "right" | "center" | "after-sign" | null;
  fillChar?: string | null;
  emptyWhenZero: boolean;
  sections?: SectionSpec[];
  dialectSpecific?: Record<string, unknown>;
}

interface ParseResult {
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
```

### Internal schema design notes

- `normalizedExternal` should always include an explicit prefix such as `excel:` or `python:`.
- `sections` are required when the source dialect is Excel and semicolon sections are present.
- `dialectSpecific` should preserve source-only constructs that do not map cleanly to the shared schema.
- The shared schema should express intent, not raw syntax.

---

## Parsing strategy

Do **not** build one giant mixed grammar.

Build two independent parsers and a lightweight arbitration layer:

1. pre-normalize the raw input,
2. detect explicit dialect prefixes,
3. attempt parse with the requested or inferred dialect(s),
4. score each parse,
5. choose the highest-confidence parse,
6. if confidence is too close, return `ambiguous` with recommendations.

### Pre-normalization

Apply these steps before parsing:

1. trim leading and trailing whitespace,
2. detect and strip an explicit `excel:` or `python:` prefix,
3. detect a full brace-wrapped Python field such as `{.2f}` or `{:,.2f}`,
4. preserve the original input exactly,
5. do not remove quotes, commas, or semicolons before lexing.

### Python wrapper normalization

If the entire input matches a single replacement field:

```text
^{.*}$
```

then:

- remove the outer braces,
- if the first inner character is `:`, remove it,
- parse the remainder as a Python format spec.

Examples:

```text
{.2f}     -> .2f
{:,.2f}   -> ,.2f
{05}      -> 05
```

---

## Dialect detection and scoring

### Hard signals for Excel

Increase Excel score heavily when any of the following are present:

- semicolons outside quotes and escapes
- quoted literals such as `"MM"`
- bracket tokens such as `[Red]` or `[<=100]`
- repeated trailing commas after digit placeholders
- currency or literal prefixes attached to placeholder patterns, such as `$#,##0.0`
- explicit Excel exponent style such as `E+00`

### Hard signals for Python

Increase Python score heavily when any of the following are present:

- full brace wrapping such as `{.2f}` or `{:05}`
- valid Python align, width, fill, or grouping patterns
- valid Python precision and type combinations such as `.2f`, `.2%`, `.2e`
- bare grouping spec `,`
- zero-pad width patterns like `05`

### Suggested scoring model

A simple weighted model is enough.

```text
+100 explicit dialect prefix
+40 full Python braces
+35 Excel semicolon sectioning
+30 Excel quoted literals
+30 Excel bracket tokens
+25 Python precision+type pair
+20 Python width/alignment/zero-pad pattern
+20 Excel trailing scaling commas
+15 Excel placeholder runs with decimal point
-20 for each required auto-repair
-100 on hard parse failure
```

### Arbitration rule

- If only one parser succeeds, choose it.
- If both succeed and one score exceeds the other by at least 25 points, choose the higher one.
- If both succeed and the difference is less than 25 points, return `ambiguous` unless one parse required repairs and the other did not.
- If both fail, return `invalid`.

### Decision-flow pseudocode

```text
parseNumericFormat(input, requestedDialect = "auto", mode = "lenient"):
  original = input
  raw = trim(input)

  forcedDialect, raw = stripExplicitPrefix(raw)
  dialect = forcedDialect or requestedDialect

  pythonCandidateRaw, wrapperWarnings = normalizePythonWrapper(raw, mode)

  candidates = []

  if dialect in ["auto", "excel"]:
    candidates.append(parseExcel(raw, mode))

  if dialect in ["auto", "python"]:
    candidates.append(parsePython(pythonCandidateRaw, mode, wrapperWarnings))

  scored = scoreCandidates(candidates)
  winner = arbitrate(scored)

  if winner is ambiguous:
    return ambiguityResult(original, scored)

  if winner failed:
    return invalidResult(original, scored)

  return buildParseResult(original, winner)
```

---

## Grammar sketch

These are implementation-oriented grammar sketches, not full formal grammars.

### Excel numeric subset

```text
excel-format   ::= excel-section (';' excel-section){0,3}
excel-section  ::= { excel-token }
excel-token    ::= placeholder
                 | decimal-point
                 | comma
                 | percent
                 | scientific
                 | quoted-literal
                 | escaped-char
                 | bracket-token
                 | literal-char

placeholder    ::= '0' | '#' | '?'
decimal-point  ::= '.'
comma          ::= ','
percent        ::= '%'
scientific     ::= ('E' | 'e') ('+' | '-') '0'+
quoted-literal ::= '"' { char - '"' } '"'
escaped-char   ::= '\\' any-char
bracket-token  ::= '[' { char - ']' } ']'
literal-char   ::= any-char not otherwise tokenized
```

### Python numeric subset

```text
python-input   ::= python-spec | '{' [ ':' ] python-spec '}'
python-spec    ::= [[fill]align] [sign] ['z'] ['#'] ['0'] [width] [grouping] ['.' precision] [type]
align          ::= '<' | '>' | '^' | '='
sign           ::= '+' | '-' | ' '
fill           ::= any single char except '{' or '}'
width          ::= digit+
grouping       ::= ',' | '_'
precision      ::= digit+
type           ::= 'd' | 'e' | 'E' | 'f' | 'F' | 'g' | 'G' | 'n' | '%'
```

### Lenient Python extension

In `lenient` mode only:

```text
precision ::= digit*
```

But an empty precision must trigger a repair warning and a specific repair rule.

---

## Collision matrix and recommendations

The system should not silently guess on high-risk collisions.

| Input | Excel interpretation | Python interpretation | Recommended behavior |
|---|---|---|---|
| `05` | one digit placeholder followed by literal `5` | zero-pad to width 5 | mark ambiguous in auto mode; recommend `python:05` for Python or `excel:0"5"` for Excel |
| `e` | literal `e` | scientific notation type | mark ambiguous; recommend `python:.2e` or quote the Excel literal intent |
| `n` | literal `n` | locale-aware numeric type | mark ambiguous; recommend `python:n` only with explicit prefix |
| `.2` | weak/odd Excel literal pattern | Python precision 2 using general format | prefer Python but emit low-confidence warning unless prefixed |
| `0.0` | fixed 1 decimal place | not idiomatic Python numeric spec | choose Excel |
| `,` | not useful Excel numeric format by itself | grouping separator | choose Python |
| `{.2f}` | not Excel syntax | Python shorthand replacement field | choose Python and normalize to `python:.2f` |
| `0.0,,"MM"` | divide by 1,000,000 and append `MM` | not Python syntax | choose Excel |
| `+0%;-0%;0%` | section-based Excel sign behavior | not Python syntax | choose Excel |

### General collision policy

- Prefer **explicit prefixes** for saved configurations.
- Prefer **warnings over silent conversion** when both dialects can produce a plausible parse.
- Prefer **human-readable repair suggestions** that show the exact canonical form to use.

---

## Repair rules

Repairs should be conservative and fully reported.

### Allowed repairs in lenient mode

1. **Strip Python braces**
   - `{.2f}` -> `.2f`
   - Warning: `PY_WRAPPER_NORMALIZED`

2. **Strip leading colon inside Python braces**
   - `{:05}` -> `05`
   - Warning: `PY_WRAPPER_NORMALIZED`

3. **Repair missing scientific precision in Python shorthand**
   - `.e` -> `.2e`
   - Warning: `PY_REPAIRED_MISSING_SCI_PRECISION`

4. **Quote literal Excel suffixes when canonicalizing**
   - `0.0,,MM` may be accepted only if the lexer can prove `MM` is literal text and not a date/time token in the current scope
   - canonicalize to `0.0,,"MM"`
   - Warning: `XL_LITERAL_CANONICALIZED`

### Repairs to avoid

Do not automatically:

- convert Excel to Python syntax,
- convert Python to Excel syntax,
- infer locale-specific tokens,
- rewrite ambiguous raw inputs like `05` without emitting an ambiguity warning,
- reinterpret date/time-looking Excel tokens as numeric suffixes unless clearly quoted.

---

## Validation and issue taxonomy

Recommended issue codes:

```text
AMBIGUOUS_DIALECT
INVALID_FORMAT
UNSUPPORTED_FEATURE
UNBALANCED_QUOTES
UNBALANCED_BRACES
TOO_MANY_SECTIONS
NON_NUMERIC_EXCEL_TOKEN
MIXED_DIALECT_TOKENS
PY_WRAPPER_NORMALIZED
PY_REPAIRED_MISSING_SCI_PRECISION
XL_LITERAL_CANONICALIZED
LOW_CONFIDENCE_PARSE
```

Severity guidance:

- `error`: the format should not be accepted.
- `warning`: the format is accepted but normalized, repaired, or low-confidence.

---

## Canonicalization rules

### Canonical external form

Always emit:

```text
excel:<normalized excel spec>
python:<normalized python spec>
```

### Canonicalization for Excel

- preserve section order,
- preserve quoted literals,
- preserve scaling commas,
- preserve bracket tokens as written,
- normalize obviously literal suffix text into quoted form when repaired,
- keep `.` and `,` as invariant syntax tokens in v1.

### Canonicalization for Python

- remove outer braces,
- remove a single leading `:` from wrapped forms,
- preserve the normalized format spec only,
- repair non-standard shorthand only in `lenient` mode and record the repair.

---

## Reference rendering targets

These are the native or normalized render targets implied by this spec:

```text
excel:$#,##0.0 with 65 -> $65.0
excel:0.0,,"MM" with 56999999 -> 57.0MM
excel:+0%;-0%;0% with 0.342 -> +34%
excel:0;-0;"" with 0 -> ""
python:.2f with 3.14159 -> 3.14
python:, with 10000000 -> 10,000,000
python:.2% with 0.75413 -> 75.41%
python:.2e with 1234567.89 -> 1.23e+06
python:05 with 42 -> 00042
```

---

## Worked examples

### Excel examples

Input:

```text
$#,##0.0
```

Expected parse summary:

```json
{
  "detectedDialect": "excel",
  "normalizedExternal": "excel:$#,##0.0",
  "canonical": {
    "notation": "fixed",
    "prefix": "$",
    "suffix": "",
    "minIntegerDigits": 1,
    "minFractionDigits": 1,
    "maxFractionDigits": 1,
    "grouping": { "kind": "comma", "size": 3 },
    "scaleThousands": 0,
    "percent": false,
    "signPolicy": "negative-only",
    "negativeStyle": "minus",
    "emptyWhenZero": false
  }
}
```

Input:

```text
0.0,,"MM"
```

Expected parse summary:

```json
{
  "detectedDialect": "excel",
  "normalizedExternal": "excel:0.0,,\"MM\"",
  "canonical": {
    "notation": "fixed",
    "prefix": "",
    "suffix": "MM",
    "minIntegerDigits": 1,
    "minFractionDigits": 1,
    "maxFractionDigits": 1,
    "grouping": { "kind": "none", "size": 3 },
    "scaleThousands": 2,
    "percent": false
  }
}
```

Input:

```text
+0%;-0%;0%
```

Expected parse summary:

```json
{
  "detectedDialect": "excel",
  "normalizedExternal": "excel:+0%;-0%;0%",
  "canonical": {
    "notation": "percent",
    "signPolicy": "section-based",
    "sections": [
      { "role": "positive", "prefix": "+", "suffix": "%", "percent": true },
      { "role": "negative", "prefix": "-", "suffix": "%", "percent": true },
      { "role": "zero", "prefix": "", "suffix": "%", "percent": true }
    ]
  }
}
```

Input:

```text
0;-0;""
```

Expected parse summary:

```json
{
  "detectedDialect": "excel",
  "normalizedExternal": "excel:0;-0;\"\"",
  "canonical": {
    "notation": "integer",
    "signPolicy": "section-based",
    "emptyWhenZero": true,
    "sections": [
      { "role": "positive", "emptyOutput": false },
      { "role": "negative", "emptyOutput": false },
      { "role": "zero", "emptyOutput": true }
    ]
  }
}
```

### Python examples

Input:

```text
{.2f}
```

Expected parse summary:

```json
{
  "detectedDialect": "python",
  "normalizedExternal": "python:.2f",
  "warnings": [
    { "code": "PY_WRAPPER_NORMALIZED", "severity": "warning" }
  ],
  "canonical": {
    "notation": "fixed",
    "minFractionDigits": 2,
    "maxFractionDigits": 2,
    "grouping": { "kind": "none", "size": 3 }
  }
}
```

Input:

```text
{,}
```

Expected parse summary:

```json
{
  "detectedDialect": "python",
  "normalizedExternal": "python:,",
  "warnings": [
    { "code": "PY_WRAPPER_NORMALIZED", "severity": "warning" }
  ],
  "canonical": {
    "notation": "general",
    "grouping": { "kind": "comma", "size": 3 }
  }
}
```

Input:

```text
{.2%}
```

Expected parse summary:

```json
{
  "detectedDialect": "python",
  "normalizedExternal": "python:.2%",
  "warnings": [
    { "code": "PY_WRAPPER_NORMALIZED", "severity": "warning" }
  ],
  "canonical": {
    "notation": "percent",
    "minFractionDigits": 2,
    "maxFractionDigits": 2,
    "percent": true
  }
}
```

Input:

```text
{.e}
```

Expected parse summary in `lenient` mode:

```json
{
  "detectedDialect": "python",
  "normalizedExternal": "python:.2e",
  "warnings": [
    { "code": "PY_WRAPPER_NORMALIZED", "severity": "warning" },
    { "code": "PY_REPAIRED_MISSING_SCI_PRECISION", "severity": "warning" }
  ],
  "canonical": {
    "notation": "scientific",
    "minFractionDigits": 2,
    "maxFractionDigits": 2
  }
}
```

Input:

```text
{05}
```

Expected parse summary:

```json
{
  "detectedDialect": "python",
  "normalizedExternal": "python:05",
  "warnings": [
    { "code": "PY_WRAPPER_NORMALIZED", "severity": "warning" }
  ],
  "canonical": {
    "notation": "general",
    "zeroPaddingWidth": 5,
    "width": 5,
    "align": "after-sign"
  }
}
```

---

## Recommended implementation sequence

### Phase 1

- explicit prefix handling
- Python wrapper normalization
- Excel numeric subset parser
- Python numeric subset parser
- ambiguity scoring
- canonical external output
- issue reporting

### Phase 2

- Excel conditions and colors with full semantics
- locale-aware rendering options
- richer preview generation
- optional format conversion utilities

---

## Recommended UI behavior

When users enter a format string, immediately show:

- detected dialect,
- canonical saved form,
- preview output on sample values,
- any warnings,
- a one-click way to force `excel` or `python` if ambiguous.

Suggested preview values:

```text
65
56999999
0.342
0
3.14159
10000000
0.75413
1234567.89
-42.5
```

This is especially important for ambiguous inputs such as `05`, `e`, and `n`.

---

## Final recommendation

Use **auto-detect + explicit canonical storage**.

Specifically:

1. Accept unprefixed Excel-like and Python-like user inputs in `lenient` mode.
2. Parse with two separate dialect parsers.
3. Normalize accepted inputs into a shared `NumberFormatSpec` AST.
4. Persist an explicit canonical external form like `excel:$#,##0.0` or `python:.2f`.
5. Warn, rather than silently guess, on syntax collisions.
6. Support a small, documented repair set for common user shorthand.

This gives spreadsheet users a familiar entry path, gives engineers a predictable API, and gives downstream code generation a stable machine-readable target.
