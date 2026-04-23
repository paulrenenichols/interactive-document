import { medianLinear, percentileLinear } from "../math/percentileLinear";
import { mergeCallArguments } from "./callArgs";
import type { ExprNode, SeriesSemanticMeta } from "./contracts";
import { getFunctionSpec } from "./contracts";
import { parseFormula } from "./parseFormula";

export type CellValue = number | string | boolean | null;

export type FormulaResult =
  | { kind: "scalar"; value: CellValue }
  | { kind: "row"; values: CellValue[] }
  | { kind: "index"; values: CellValue[]; alignedIndexId?: string | null };

export interface SeriesRuntime {
  meta: SeriesSemanticMeta;
  values: CellValue[];
}

export interface FormulaEvalContext {
  seriesByName: Map<string, SeriesRuntime>;
  rowCount: number;
}

export interface EvalError {
  error: string;
}

function asRow(r: FormulaResult, ctx: FormulaEvalContext): CellValue[] | null {
  if (r.kind === "scalar") {
    const a: CellValue[] = [];
    for (let i = 0; i < ctx.rowCount; i++) a.push(r.value);
    return a;
  }
  if (r.kind === "row") return r.values;
  return null;
}

function cellTruthy(v: CellValue): boolean {
  if (v === null || v === false) return false;
  if (v === true) return true;
  if (typeof v === "number") return v !== 0 && !Number.isNaN(v);
  return Boolean(v);
}

function cellEqual(a: CellValue, b: CellValue): boolean {
  if (a === null || b === null) return a === b;
  if (typeof a === "number" && typeof b === "number") return a === b;
  return String(a) === String(b);
}

function toNumber(v: CellValue): number | null {
  if (v === null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "boolean") return v ? 1 : 0;
  const n = parseFloat(String(v));
  return Number.isNaN(n) ? null : n;
}

export function evaluateFormula(
  formulaText: string,
  ctx: FormulaEvalContext,
): FormulaResult | EvalError {
  const parsed = parseFormula(formulaText);
  if (!parsed.ok) return { error: parsed.error };
  try {
    return evalNode(parsed.ast, ctx);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg };
  }
}

function evalNode(node: ExprNode, ctx: FormulaEvalContext): FormulaResult {
  switch (node.kind) {
    case "literal":
      return { kind: "scalar", value: node.value };
    case "series_ref": {
      const s = ctx.seriesByName.get(node.name);
      if (!s) throw new Error(`Unknown series: [${node.name}]`);
      const { meta, values } = s;
      if (meta.grainKind === "scalar") return { kind: "scalar", value: values[0] ?? null };
      if (meta.grainKind === "row") return { kind: "row", values };
      return { kind: "index", values, alignedIndexId: meta.alignedIndexId ?? null };
    }
    case "unary": {
      const a = evalNode(node.arg, ctx);
      if (node.op === "-") {
        const num = toScalarNum(a, ctx);
        if (num === null) return { kind: "scalar", value: null };
        return { kind: "scalar", value: -num };
      }
      if (node.op === "NOT") {
        const b = asBoolVec(a, ctx);
        if (!b) throw new Error("NOT expects row or scalar boolean");
        if (b.kind === "scalar") return { kind: "scalar", value: !cellTruthy(b.value) };
        return {
          kind: "row",
          values: b.values.map((x) => !cellTruthy(x)),
        };
      }
      throw new Error(`Unknown unary ${node.op}`);
    }
    case "binary": {
      const left = evalNode(node.left, ctx);
      const right = evalNode(node.right, ctx);
      return evalBinary(node.op, left, right, ctx);
    }
    case "call": {
      return evalCall(node, ctx);
    }
  }
}

function toScalarNum(r: FormulaResult, _ctx: FormulaEvalContext): number | null {
  if (r.kind !== "scalar") return null;
  return toNumber(r.value);
}

function asBoolVec(
  r: FormulaResult,
  _ctx: FormulaEvalContext,
): { kind: "scalar"; value: CellValue } | { kind: "row"; values: CellValue[] } | null {
  if (r.kind === "scalar") return r;
  if (r.kind === "row") return r;
  return null;
}

function evalBinary(
  op: string,
  left: FormulaResult,
  right: FormulaResult,
  ctx: FormulaEvalContext,
): FormulaResult {
  const broadcast = (fn: (a: CellValue, b: CellValue) => CellValue): FormulaResult => {
    if (left.kind === "scalar" && right.kind === "scalar") {
      return { kind: "scalar", value: fn(left.value, right.value) };
    }
    const lr = asRow(left, ctx);
    const rr = asRow(right, ctx);
    if (!lr || !rr || lr.length !== rr.length) {
      throw new Error("Binary operation requires aligned row vectors or scalars");
    }
    const out: CellValue[] = [];
    for (let i = 0; i < lr.length; i++) {
      out.push(fn(lr[i]!, rr[i]!));
    }
    return { kind: "row", values: out };
  };

  if (op === "&") {
    return broadcast((a, b) => String(a ?? "") + String(b ?? ""));
  }
  if (op === "=")
    return broadcast((a, b) => (cellEqual(a, b) ? true : false));
  if (op === "!=") return broadcast((a, b) => (!cellEqual(a, b) ? true : false));
  if (op === "<") return broadcast((a, b) => compareNum(a, b, (x, y) => x < y));
  if (op === ">") return broadcast((a, b) => compareNum(a, b, (x, y) => x > y));
  if (op === "<=") return broadcast((a, b) => compareNum(a, b, (x, y) => x <= y));
  if (op === ">=") return broadcast((a, b) => compareNum(a, b, (x, y) => x >= y));

  const numOp = (a: CellValue, b: CellValue): CellValue => {
    const x = toNumber(a);
    const y = toNumber(b);
    if (x === null || y === null) return null;
    switch (op) {
      case "+":
        return x + y;
      case "-":
        return x - y;
      case "*":
        return x * y;
      case "/":
        return y === 0 ? null : x / y;
      case "^":
        return x ** y;
      default:
        throw new Error(`Unknown op ${op}`);
    }
  };
  return broadcast(numOp);
}

function compareNum(
  a: CellValue,
  b: CellValue,
  cmp: (x: number, y: number) => boolean,
): boolean {
  const x = toNumber(a);
  const y = toNumber(b);
  if (x === null || y === null) return false;
  return cmp(x, y);
}

function evalCall(node: ExprNode & { kind: "call" }, ctx: FormulaEvalContext): FormulaResult {
  const spec = getFunctionSpec(node.fn);
  if (!spec) throw new Error(`Unknown function ${node.fn}`);
  if (spec.evalImpl === "stub") {
    throw new Error(`${node.fn} evaluation is not implemented yet`);
  }

  const merged = mergeCallArguments(spec, node.args, node.kwargs);
  if (merged.error) throw new Error(merged.error);
  const m = merged.map;

  switch (node.fn) {
    case "SUM":
      return aggScalar(
        m["values"]!,
        m["where"],
        ctx,
        (nums) => nums.reduce((a, b) => a + b, 0),
        true,
      );
    case "AVG":
      return aggScalar(
        m["values"]!,
        m["where"],
        ctx,
        (nums) => {
          if (nums.length === 0) return null;
          return nums.reduce((a, b) => a + b, 0) / nums.length;
        },
        true,
      );
    case "MEDIAN":
      return aggScalar(
        m["values"]!,
        m["where"],
        ctx,
        (nums) => {
          if (nums.length === 0) return null;
          const sorted = [...nums].sort((a, b) => a - b);
          return medianLinear(sorted);
        },
        true,
      );
    case "MIN":
      return aggScalar(
        m["values"]!,
        m["where"],
        ctx,
        (nums) => (nums.length === 0 ? null : Math.min(...nums)),
        true,
      );
    case "MAX":
      return aggScalar(
        m["values"]!,
        m["where"],
        ctx,
        (nums) => (nums.length === 0 ? null : Math.max(...nums)),
        true,
      );
    case "COUNT":
      return evalCount(m["values"]!, m["where"], ctx);
    case "COUNT_ROWS": {
      const w = m["where"];
      if (!w) return { kind: "scalar", value: ctx.rowCount };
      const wr = evalNode(w, ctx);
      const row = asRow(wr, ctx);
      if (!row) throw new Error("COUNT_ROWS where must be row or scalar");
      let c = 0;
      for (let i = 0; i < ctx.rowCount; i++) {
        if (cellTruthy(row[i] ?? null)) c++;
      }
      return { kind: "scalar", value: c };
    }
    case "LEN": {
      const s = evalNode(m["series"]!, ctx);
      if (s.kind === "scalar") return { kind: "scalar", value: 1 };
      if (s.kind === "row") return { kind: "scalar", value: s.values.length };
      return { kind: "scalar", value: s.values.length };
    }
    case "PERCENTILE": {
      const pExpr = m["p"];
      const pv = pExpr ? evalNode(pExpr, ctx) : null;
      let p01: number | null = null;
      if (pv?.kind === "scalar") p01 = toNumber(pv.value);
      if (p01 === null) throw new Error("PERCENTILE requires p in [0, 1]");
      const p100 = p01 * 100;
      return aggScalar(
        m["values"]!,
        m["where"],
        ctx,
        (nums) => {
          if (nums.length === 0) return null;
          const sorted = [...nums].sort((a, b) => a - b);
          return percentileLinear(sorted, p100);
        },
        true,
      );
    }
    case "MEDIAN_BY":
      return evalBy(
        m["values"]!,
        m["index"]!,
        m["where"],
        ctx,
        (nums) => {
          if (nums.length === 0) return null;
          const sorted = [...nums].sort((a, b) => a - b);
          return medianLinear(sorted);
        },
        true,
      );
    case "SUM_BY":
      return evalBy(
        m["values"]!,
        m["index"]!,
        m["where"],
        ctx,
        (nums) => (nums.length === 0 ? null : nums.reduce((a, b) => a + b, 0)),
        true,
      );
    case "AVG_BY":
      return evalBy(
        m["values"]!,
        m["index"]!,
        m["where"],
        ctx,
        (nums) =>
          nums.length === 0 ? null : nums.reduce((a, b) => a + b, 0) / nums.length,
        true,
      );
    case "COUNT_BY":
      return evalCountBy(m["index"]!, m["where"], ctx);
    case "MIN_BY":
      return evalBy(
        m["values"]!,
        m["index"]!,
        m["where"],
        ctx,
        (nums) => (nums.length === 0 ? null : Math.min(...nums)),
        true,
      );
    case "MAX_BY":
      return evalBy(
        m["values"]!,
        m["index"]!,
        m["where"],
        ctx,
        (nums) => (nums.length === 0 ? null : Math.max(...nums)),
        true,
      );
    case "PERCENTILE_BY": {
      const pExpr = m["p"];
      const pv = pExpr ? evalNode(pExpr, ctx) : null;
      let p01: number | null = null;
      if (pv?.kind === "scalar") p01 = toNumber(pv.value);
      if (p01 === null) throw new Error("PERCENTILE_BY requires p in [0, 1]");
      const p100 = p01 * 100;
      return evalBy(
        m["values"]!,
        m["index"]!,
        m["where"],
        ctx,
        (nums) => {
          if (nums.length === 0) return null;
          const sorted = [...nums].sort((a, b) => a - b);
          return percentileLinear(sorted, p100);
        },
        true,
      );
    }
    case "IF": {
      const c = evalNode(m["condition"]!, ctx);
      const t = evalNode(m["trueExpr"]!, ctx);
      const f = evalNode(m["falseExpr"]!, ctx);
      return evalIf(c, t, f, ctx);
    }
    case "AND": {
      const parts: ExprNode[] = [];
      for (let i = 0; ; i++) {
        const x = m[`arg${i}`];
        if (!x) break;
        parts.push(x);
      }
      return foldBool("and", parts, ctx);
    }
    case "OR": {
      const parts: ExprNode[] = [];
      for (let i = 0; ; i++) {
        const x = m[`arg${i}`];
        if (!x) break;
        parts.push(x);
      }
      return foldBool("or", parts, ctx);
    }
    case "NOT": {
      const a = evalNode(m["value"]!, ctx);
      return negateBoolResult(a, ctx);
    }
    case "ISBLANK": {
      const a = evalNode(m["value"]!, ctx);
      if (a.kind === "scalar") return { kind: "scalar", value: a.value === null };
      return {
        kind: "row",
        values: a.values.map((v) => v === null),
      };
    }
    case "COALESCE": {
      const parts: ExprNode[] = [];
      for (let i = 0; ; i++) {
        const x = m[`arg${i}`];
        if (!x) break;
        parts.push(x);
      }
      if (parts.length === 0) return { kind: "scalar", value: null };
      const vals = parts.map((p) => evalNode(p, ctx));
      return coalesceVals(vals, ctx);
    }
    case "IN": {
      const v = evalNode(m["value"]!, ctx);
      const opts: ExprNode[] = [];
      for (let i = 1; ; i++) {
        const x = m[`opt${i}`];
        if (!x) break;
        opts.push(x);
      }
      return evalIn(v, opts.map((o) => evalNode(o, ctx)), ctx);
    }
    case "CONCAT": {
      const parts: ExprNode[] = [];
      for (let i = 0; ; i++) {
        const x = m[`arg${i}`];
        if (!x) break;
        parts.push(x);
      }
      if (parts.length === 0) return { kind: "scalar", value: "" };
      let acc = evalNode(parts[0]!, ctx);
      for (let i = 1; i < parts.length; i++) {
        acc = evalBinary("&", acc, evalNode(parts[i]!, ctx), ctx);
      }
      return acc;
    }
    default:
      throw new Error(`${node.fn} not implemented`);
  }
}

function coalesceVals(vals: FormulaResult[], ctx: FormulaEvalContext): FormulaResult {
  if (vals.every((v) => v.kind === "scalar")) {
    for (const v of vals) {
      if (v.kind === "scalar" && v.value !== null) return v;
    }
    return { kind: "scalar", value: null };
  }
  const rows = vals.map((v) => asRow(v, ctx));
  if (rows.some((r) => !r)) throw new Error("COALESCE alignment");
  const n = rows[0]!.length;
  const out: CellValue[] = [];
  for (let i = 0; i < n; i++) {
    let picked: CellValue = null;
    for (const r of rows) {
      const c = r![i]!;
      if (c !== null) {
        picked = c;
        break;
      }
    }
    out.push(picked);
  }
  return { kind: "row", values: out };
}

function evalIn(
  value: FormulaResult,
  options: FormulaResult[],
  ctx: FormulaEvalContext,
): FormulaResult {
  if (value.kind === "scalar") {
    const v = value.value;
    for (const o of options) {
      if (o.kind !== "scalar") throw new Error("IN options must be scalar when value is scalar");
      if (cellEqual(v, o.value)) return { kind: "scalar", value: true };
    }
    return { kind: "scalar", value: false };
  }
  const vr = value.values;
  const orows = options.map((o) => asRow(o, ctx));
  if (orows.some((r) => !r || r.length !== vr.length)) throw new Error("IN alignment");
  const out: CellValue[] = [];
  for (let i = 0; i < vr.length; i++) {
    let ok = false;
    for (const r of orows) {
      if (cellEqual(vr[i]!, r![i]!)) {
        ok = true;
        break;
      }
    }
    out.push(ok);
  }
  return { kind: "row", values: out };
}

function negateBoolResult(a: FormulaResult, ctx: FormulaEvalContext): FormulaResult {
  if (a.kind === "scalar") return { kind: "scalar", value: !cellTruthy(a.value) };
  const r = asRow(a, ctx);
  if (!r) throw new Error("NOT expects row or scalar boolean");
  return { kind: "row", values: r.map((v) => !cellTruthy(v)) };
}

function foldBool(
  mode: "and" | "or",
  parts: ExprNode[],
  ctx: FormulaEvalContext,
): FormulaResult {
  if (parts.length === 0) {
    throw new Error(mode === "and" ? "AND requires at least one argument" : "OR requires at least one argument");
  }
  const evaled = parts.map((p) => evalNode(p, ctx));
  if (evaled.every((x) => x.kind === "scalar")) {
    if (mode === "and") {
      return { kind: "scalar", value: evaled.every((x) => cellTruthy(x.value)) };
    }
    return { kind: "scalar", value: evaled.some((x) => cellTruthy(x.value)) };
  }
  const rows = evaled.map((e) => asRow(e, ctx));
  if (rows.some((r) => !r)) throw new Error(`${mode.toUpperCase()} requires aligned row vectors or scalars`);
  const n = rows[0]!.length;
  const out: CellValue[] = [];
  for (let i = 0; i < n; i++) {
    if (mode === "and") {
      out.push(rows.every((r) => cellTruthy(r![i]!)));
    } else {
      out.push(rows.some((r) => cellTruthy(r![i]!)));
    }
  }
  return { kind: "row", values: out };
}

function evalIf(
  cond: FormulaResult,
  t: FormulaResult,
  f: FormulaResult,
  ctx: FormulaEvalContext,
): FormulaResult {
  const cr = asRow(cond, ctx);
  if (!cr) {
    const ok = cellTruthy(cond.kind === "scalar" ? cond.value : null);
    return ok ? t : f;
  }
  const tr = asRow(t, ctx);
  const fr = asRow(f, ctx);
  if (!tr || !fr || tr.length !== fr.length || tr.length !== cr.length) {
    throw new Error("IF branch alignment");
  }
  const out: CellValue[] = [];
  for (let i = 0; i < cr.length; i++) {
    out.push(cellTruthy(cr[i]!) ? tr[i]! : fr[i]!);
  }
  return { kind: "row", values: out };
}

function isNonNullCell(v: CellValue): boolean {
  return v !== null;
}

function evalCount(
  valuesExpr: ExprNode,
  whereExpr: ExprNode | undefined,
  ctx: FormulaEvalContext,
): FormulaResult {
  const vr = evalNode(valuesExpr, ctx);
  const row = asRow(vr, ctx);
  if (!row) {
    return { kind: "scalar", value: isNonNullCell(vr.kind === "scalar" ? vr.value : null) ? 1 : 0 };
  }
  let mask: CellValue[] | null = null;
  if (whereExpr) {
    const w = evalNode(whereExpr, ctx);
    const wr = asRow(w, ctx);
    if (!wr) {
      if (!cellTruthy(w.kind === "scalar" ? w.value : null)) {
        return { kind: "scalar", value: 0 };
      }
    } else {
      mask = wr;
    }
  }
  let c = 0;
  for (let i = 0; i < row.length; i++) {
    if (mask && !cellTruthy(mask[i] ?? null)) continue;
    if (isNonNullCell(row[i]!)) c++;
  }
  return { kind: "scalar", value: c };
}

function aggScalar(
  valuesExpr: ExprNode,
  whereExpr: ExprNode | undefined,
  ctx: FormulaEvalContext,
  fn: (nums: number[]) => CellValue,
  ignoreNulls: boolean,
): FormulaResult {
  const vr = evalNode(valuesExpr, ctx);
  const row = asRow(vr, ctx);
  if (!row) {
    const n = toNumber(vr.kind === "scalar" ? vr.value : null);
    const nums = n === null ? [] : [n];
    return { kind: "scalar", value: fn(nums) };
  }
  let mask: CellValue[] | null = null;
  if (whereExpr) {
    const w = evalNode(whereExpr, ctx);
    const wr = asRow(w, ctx);
    if (!wr) {
      const pass = cellTruthy(w.kind === "scalar" ? w.value : null);
      if (!pass) return { kind: "scalar", value: fn([]) };
    } else {
      mask = wr;
    }
  }
  const nums: number[] = [];
  for (let i = 0; i < row.length; i++) {
    if (mask && !cellTruthy(mask[i] ?? null)) continue;
    const n = toNumber(row[i]!);
    if (n === null) {
      if (!ignoreNulls) nums.push(NaN);
      continue;
    }
    nums.push(n);
  }
  return { kind: "scalar", value: fn(nums) };
}

function evalBy(
  valuesExpr: ExprNode,
  indexExpr: ExprNode,
  whereExpr: ExprNode | undefined,
  ctx: FormulaEvalContext,
  fn: (nums: number[]) => CellValue,
  ignoreNulls: boolean,
): FormulaResult {
  const ix = evalNode(indexExpr, ctx);
  if (ix.kind !== "index") throw new Error("_BY requires an index-grain second argument");
  const indexMeta = ctx.seriesByName.get(
    indexExpr.kind === "series_ref" ? indexExpr.name : "",
  )?.meta;
  const keys = ix.values;
  const sourceName =
    indexMeta?.indexSourceSeriesName ??
    (indexMeta?.indexSourceSeriesId
      ? [...ctx.seriesByName.entries()].find(
          ([, r]) => r.meta.id === indexMeta.indexSourceSeriesId,
        )?.[0]
      : null);
  if (!sourceName) {
    throw new Error(
      "Index series must provide indexSourceSeriesName or a resolvable indexSourceSeriesId for grouping",
    );
  }

  const g = ctx.seriesByName.get(sourceName);
  if (!g || g.meta.grainKind !== "row") {
    throw new Error(`Grouping series [${sourceName}] must be row-grain`);
  }
  const groupRow = g.values;

  let mask: CellValue[] | null = null;
  if (whereExpr) {
    const w = evalNode(whereExpr, ctx);
    const wr = asRow(w, ctx);
    if (!wr) {
      if (!cellTruthy(w.kind === "scalar" ? w.value : null)) {
        return { kind: "index", values: keys.map(() => null), alignedIndexId: ix.alignedIndexId };
      }
    } else {
      mask = wr;
    }
  }

  const vals = evalNode(valuesExpr, ctx);
  const valRow = asRow(vals, ctx);
  if (!valRow || valRow.length !== ctx.rowCount) {
    throw new Error("values must be row-grain aligned to dataset");
  }

  const out: CellValue[] = [];
  for (const key of keys) {
    const nums: number[] = [];
    for (let i = 0; i < ctx.rowCount; i++) {
      if (mask && !cellTruthy(mask[i] ?? null)) continue;
      if (!cellEqual(groupRow[i]!, key)) continue;
      const n = toNumber(valRow[i]!);
      if (n === null) {
        if (!ignoreNulls) nums.push(NaN);
        continue;
      }
      nums.push(n);
    }
    out.push(fn(nums));
  }
  return { kind: "index", values: out, alignedIndexId: ix.alignedIndexId };
}

function evalCountBy(
  indexExpr: ExprNode,
  whereExpr: ExprNode | undefined,
  ctx: FormulaEvalContext,
): FormulaResult {
  const ix = evalNode(indexExpr, ctx);
  if (ix.kind !== "index") throw new Error("COUNT_BY requires an index-grain argument");
  const indexMeta = ctx.seriesByName.get(
    indexExpr.kind === "series_ref" ? indexExpr.name : "",
  )?.meta;
  const keys = ix.values;
  const sourceName =
    indexMeta?.indexSourceSeriesName ??
    (indexMeta?.indexSourceSeriesId
      ? [...ctx.seriesByName.entries()].find(
          ([, r]) => r.meta.id === indexMeta.indexSourceSeriesId,
        )?.[0]
      : null);
  if (!sourceName) {
    throw new Error(
      "Index series must provide indexSourceSeriesName or a resolvable indexSourceSeriesId for grouping",
    );
  }
  const g = ctx.seriesByName.get(sourceName);
  if (!g || g.meta.grainKind !== "row") {
    throw new Error(`Grouping series [${sourceName}] must be row-grain`);
  }
  const groupRow = g.values;

  let mask: CellValue[] | null = null;
  if (whereExpr) {
    const w = evalNode(whereExpr, ctx);
    const wr = asRow(w, ctx);
    if (!wr) {
      if (!cellTruthy(w.kind === "scalar" ? w.value : null)) {
        return { kind: "index", values: keys.map(() => 0), alignedIndexId: ix.alignedIndexId };
      }
    } else {
      mask = wr;
    }
  }

  const out: CellValue[] = [];
  for (const key of keys) {
    let c = 0;
    for (let i = 0; i < ctx.rowCount; i++) {
      if (mask && !cellTruthy(mask[i] ?? null)) continue;
      if (cellEqual(groupRow[i]!, key)) c++;
    }
    out.push(c);
  }
  return { kind: "index", values: out, alignedIndexId: ix.alignedIndexId };
}
