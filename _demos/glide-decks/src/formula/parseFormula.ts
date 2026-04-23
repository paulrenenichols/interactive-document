import type { ExprNode } from "./contracts";
import { normalizeLeadingEquals } from "./contracts";

export interface ParseOk {
  ok: true;
  ast: ExprNode;
  /** Formula after stripping optional leading `=`. */
  normalizedSource: string;
}

export interface ParseErr {
  ok: false;
  error: string;
  offset: number;
  normalizedSource: string;
}

export type ParseResult = ParseOk | ParseErr;

type Tok =
  | { type: "eof" }
  | { type: "num"; value: number; start: number }
  | { type: "str"; value: string; start: number }
  | { type: "bool"; value: boolean; start: number }
  | { type: "null"; start: number }
  | { type: "ident"; value: string; start: number }
  | { type: "series"; name: string; start: number }
  | { type: "op"; value: string; start: number }
  | { type: "lparen"; start: number }
  | { type: "rparen"; start: number }
  | { type: "comma"; start: number };

function isIdentStart(c: string): boolean {
  return /[A-Za-z_]/.test(c);
}

function isIdentPart(c: string): boolean {
  return /[A-Za-z0-9_]/.test(c);
}

export function tokenize(source: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  const n = source.length;

  const skipWs = () => {
    while (i < n && /\s/.test(source[i]!)) i++;
  };

  while (i < n) {
    skipWs();
    if (i >= n) break;
    const start = i;
    const c = source[i]!;

    if (c === "[") {
      i++;
      let name = "";
      while (i < n && source[i] !== "]") {
        name += source[i]!;
        i++;
      }
      if (i >= n || source[i] !== "]") {
        throw new Error(`Unclosed series reference [ at offset ${start}`);
      }
      i++;
      out.push({ type: "series", name: name.trim(), start });
      continue;
    }

    if (c === "(") {
      i++;
      out.push({ type: "lparen", start });
      continue;
    }
    if (c === ")") {
      i++;
      out.push({ type: "rparen", start });
      continue;
    }
    if (c === ",") {
      i++;
      out.push({ type: "comma", start });
      continue;
    }

    if (c === '"') {
      i++;
      let s = "";
      while (i < n && source[i] !== '"') {
        s += source[i]!;
        i++;
      }
      if (i < n && source[i] === '"') i++;
      out.push({ type: "str", value: s, start });
      continue;
    }

    if (
      (c >= "0" && c <= "9") ||
      (c === "." && i + 1 < n && source[i + 1]! >= "0" && source[i + 1]! <= "9")
    ) {
      let numStr = "";
      while (i < n && /[0-9.]/.test(source[i]!)) {
        numStr += source[i]!;
        i++;
      }
      const value = parseFloat(numStr);
      if (Number.isNaN(value)) {
        out.push({ type: "op", value: numStr, start });
      } else {
        out.push({ type: "num", value, start });
      }
      continue;
    }

    if (isIdentStart(c)) {
      let id = "";
      while (i < n && isIdentPart(source[i]!)) {
        id += source[i]!;
        i++;
      }
      const u = id.toUpperCase();
      if (u === "TRUE") out.push({ type: "bool", value: true, start });
      else if (u === "FALSE") out.push({ type: "bool", value: false, start });
      else if (u === "NULL") out.push({ type: "null", start });
      else out.push({ type: "ident", value: id, start });
      continue;
    }

    if (c === "<" && source[i + 1] === "=") {
      i += 2;
      out.push({ type: "op", value: "<=", start });
      continue;
    }
    if (c === ">" && source[i + 1] === "=") {
      i += 2;
      out.push({ type: "op", value: ">=", start });
      continue;
    }
    if (c === "!" && source[i + 1] === "=") {
      i += 2;
      out.push({ type: "op", value: "!=", start });
      continue;
    }

    if ("+-*/^&=<>".includes(c)) {
      i++;
      out.push({ type: "op", value: c, start });
      continue;
    }

    i++;
    out.push({ type: "op", value: c, start });
  }

  out.push({ type: "eof" });
  return out;
}

class Parser {
  private toks: Tok[];
  private pos = 0;

  constructor(toks: Tok[]) {
    this.toks = toks;
  }

  private peek(): Tok {
    return this.toks[this.pos] ?? { type: "eof" };
  }

  private advance(): Tok {
    const t = this.peek();
    if (this.pos < this.toks.length) this.pos++;
    return t;
  }

  parse(): ExprNode {
    const e = this.parseExpr();
    const t = this.peek();
    if (t.type !== "eof") {
      const pos = "start" in t ? (t as { start: number }).start : 0;
      throw new Error(`Unexpected token after expression at offset ${pos}`);
    }
    return e;
  }

  /** Comparison chain (left-assoc). */
  private parseExpr(): ExprNode {
    let left = this.parseConcat();
    for (;;) {
      const t = this.peek();
      if (t.type === "op" && isComparisonOp(t.value)) {
        this.advance();
        const right = this.parseConcat();
        left = { kind: "binary", op: t.value, left, right };
      } else break;
    }
    return left;
  }

  private parseConcat(): ExprNode {
    let left = this.parseAdd();
    for (;;) {
      const t = this.peek();
      if (t.type === "op" && t.value === "&") {
        this.advance();
        const right = this.parseAdd();
        left = { kind: "binary", op: "&", left, right };
      } else break;
    }
    return left;
  }

  private parseAdd(): ExprNode {
    let left = this.parseMul();
    for (;;) {
      const t = this.peek();
      if (t.type === "op" && (t.value === "+" || t.value === "-")) {
        this.advance();
        const right = this.parseMul();
        left = { kind: "binary", op: t.value, left, right };
      } else break;
    }
    return left;
  }

  private parseMul(): ExprNode {
    let left = this.parsePow();
    for (;;) {
      const t = this.peek();
      if (t.type === "op" && (t.value === "*" || t.value === "/")) {
        this.advance();
        const right = this.parsePow();
        left = { kind: "binary", op: t.value, left, right };
      } else break;
    }
    return left;
  }

  private parsePow(): ExprNode {
    let left = this.parseUnary();
    for (;;) {
      const t = this.peek();
      if (t.type === "op" && t.value === "^") {
        this.advance();
        const right = this.parseUnary();
        left = { kind: "binary", op: "^", left, right };
      } else break;
    }
    return left;
  }

  private parseUnary(): ExprNode {
    const t = this.peek();
    if (t.type === "op" && t.value === "-") {
      this.advance();
      return { kind: "unary", op: "-", arg: this.parseUnary() };
    }
    if (t.type === "ident" && t.value.toUpperCase() === "NOT") {
      this.advance();
      return { kind: "unary", op: "NOT", arg: this.parseUnary() };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): ExprNode {
    return this.parsePrimary();
  }

  private parsePrimary(): ExprNode {
    const t = this.peek();
    if (t.type === "num") {
      this.advance();
      return { kind: "literal", value: t.value };
    }
    if (t.type === "str") {
      this.advance();
      return { kind: "literal", value: t.value };
    }
    if (t.type === "bool") {
      this.advance();
      return { kind: "literal", value: t.value };
    }
    if (t.type === "null") {
      this.advance();
      return { kind: "literal", value: null };
    }
    if (t.type === "series") {
      this.advance();
      return { kind: "series_ref", name: t.name };
    }
    if (t.type === "lparen") {
      this.advance();
      const inner = this.parseExpr();
      const cl = this.peek();
      if (cl.type !== "rparen") throw new Error("Expected )");
      this.advance();
      return inner;
    }
    if (t.type === "ident") {
      const fn = t.value;
      this.advance();
      const nxt = this.peek();
      if (nxt.type !== "lparen") {
        throw new Error(`Expected ( after function ${fn}`);
      }
      this.advance();
      const { args, kwargs } = this.parseArgList();
      const cl = this.peek();
      if (cl.type !== "rparen") throw new Error("Expected )");
      this.advance();
      return { kind: "call", fn: fn.toUpperCase(), args, kwargs };
    }
    throw new Error(`Unexpected token ${t.type}`);
  }

  private parseArgList(): { args: ExprNode[]; kwargs: Record<string, ExprNode> } {
    const args: ExprNode[] = [];
    const kwargs: Record<string, ExprNode> = {};
    const t = this.peek();
    if (t.type === "rparen") return { args, kwargs };

    for (;;) {
      const kw = this.tryParseKwarg();
      if (kw) {
        kwargs[kw.name] = kw.value;
      } else {
        args.push(this.parseExpr());
      }
      const sep = this.peek();
      if (sep.type === "rparen") break;
      if (sep.type !== "comma") throw new Error("Expected , or )");
      this.advance();
      if (this.peek().type === "rparen") break;
    }
    return { args, kwargs };
  }

  /** IDENT = expr in arg position (not comparison). */
  private tryParseKwarg(): { name: string; value: ExprNode } | null {
    const t = this.peek();
    if (t.type !== "ident") return null;
    const nxt = this.toks[this.pos + 1];
    if (!nxt || nxt.type !== "op" || nxt.value !== "=") return null;
    const name = t.value;
    this.advance();
    this.advance();
    const value = this.parseExpr();
    return { name: name.toLowerCase(), value };
  }
}

function isComparisonOp(op: string): boolean {
  return op === "=" || op === "!=" || op === "<" || op === ">" || op === "<=" || op === ">=";
}

export function parseFormula(input: string): ParseResult {
  const normalizedSource = normalizeLeadingEquals(input);
  if (!normalizedSource.length) {
    return { ok: false, error: "Empty formula", offset: 0, normalizedSource };
  }
  let toks: Tok[];
  try {
    toks = tokenize(normalizedSource);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg, offset: 0, normalizedSource };
  }
  try {
    const p = new Parser(toks);
    const ast = p.parse();
    return { ok: true, ast, normalizedSource };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg, offset: 0, normalizedSource };
  }
}
