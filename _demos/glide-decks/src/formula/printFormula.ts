import type { ExprNode } from "./contracts";
import { parseFormula } from "./parseFormula";

function escapeString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function printLiteral(value: string | number | boolean | null): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return String(value);
  return `"${escapeString(value)}"`;
}

/** Minimal precedence for parenthesizing binary output (higher = tighter binding). */
const PREC = {
  compare: 1,
  concat: 2,
  add: 3,
  mul: 4,
  pow: 5,
  unary: 6,
  atom: 99,
} as const;

function opPrec(op: string): number {
  if (op === "=" || op === "!=" || op === "<" || op === ">" || op === "<=" || op === ">=") return PREC.compare;
  if (op === "&") return PREC.concat;
  if (op === "+" || op === "-") return PREC.add;
  if (op === "*" || op === "/") return PREC.mul;
  if (op === "^") return PREC.pow;
  return PREC.atom;
}

function needsParens(child: ExprNode, parentOp: string, side: "left" | "right"): boolean {
  if (child.kind !== "binary") return false;
  const pc = opPrec(child.op);
  const pp = opPrec(parentOp);
  if (pc < pp) return true;
  if (pc > pp) return false;
  if (parentOp === "-" && side === "right" && (child.op === "+" || child.op === "-")) return true;
  if (parentOp === "/" && side === "right") return true;
  if (parentOp === "^" && side === "right") return true;
  return false;
}

/**
 * Serialize a parsed expression to canonical source (uppercase function names from AST, stable kwarg order).
 */
export function printFormulaAst(node: ExprNode): string {
  switch (node.kind) {
    case "literal":
      return printLiteral(node.value);
    case "series_ref":
      return `[${node.name}]`;
    case "unary": {
      if (node.op === "NOT") return `NOT ${printFormulaAst(node.arg)}`;
      if (node.op === "-") {
        const inner = node.arg;
        const body =
          inner.kind === "binary" || inner.kind === "unary"
            ? `(${printFormulaAst(inner)})`
            : printFormulaAst(inner);
        return `-${body}`;
      }
      return `${node.op}${printFormulaAst(node.arg)}`;
    }
    case "binary": {
      const left =
        needsParens(node.left, node.op, "left") ? `(${printFormulaAst(node.left)})` : printFormulaAst(node.left);
      const right =
        needsParens(node.right, node.op, "right")
          ? `(${printFormulaAst(node.right)})`
          : printFormulaAst(node.right);
      return `${left} ${node.op} ${right}`;
    }
    case "call": {
      const parts: string[] = [];
      for (const a of node.args) {
        parts.push(printFormulaAst(a));
      }
      const keys = Object.keys(node.kwargs).sort();
      for (const k of keys) {
        parts.push(`${k}=${printFormulaAst(node.kwargs[k]!)}`);
      }
      return `${node.fn}(${parts.join(", ")})`;
    }
  }
}

/**
 * Uppercase reserved function names in source by parse-and-print. Returns `null` if parse fails.
 */
export function normalizeFormulaSource(source: string): string | null {
  const trimmed = source.trim();
  if (!trimmed) return null;
  const p = parseFormula(trimmed);
  if (!p.ok) return null;
  return printFormulaAst(p.ast);
}

/** First function name in preorder (outer call if root is a call; else first nested call). */
export function outermostCallFunctionName(node: ExprNode): string | null {
  if (node.kind === "call") return node.fn;
  if (node.kind === "unary") return outermostCallFunctionName(node.arg);
  if (node.kind === "binary") {
    return outermostCallFunctionName(node.left) ?? outermostCallFunctionName(node.right);
  }
  return null;
}
