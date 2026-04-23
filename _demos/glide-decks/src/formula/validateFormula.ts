import type {
  AnnotatedExprNode,
  Diagnostic,
  DiagnosticCode,
  ExprNode,
  FormulaValidationContext,
  GrainKind,
  NodeAnnotation,
  SeriesSemanticMeta,
  ValidationResult,
} from "./contracts";
import { getFunctionSpec } from "./contracts";
import { mergeCallArguments, isKnownParamKey } from "./callArgs";
import { parseFormula } from "./parseFormula";

const WHERE_MSG =
  "`where=` must evaluate at row grain or scalar grain. Use `FILTER_INDEX(...)` for output/index filtering.";

function emptyAnn(): NodeAnnotation {
  return {
    valueType: "unknown",
    grainKind: "scalar",
    nullable: true,
    errorCodes: [],
  };
}

function mergeAnn(a: NodeAnnotation, codes: DiagnosticCode[]): NodeAnnotation {
  return { ...a, errorCodes: [...a.errorCodes, ...codes] };
}

function collectSeriesRefs(node: ExprNode, out: Set<string>): void {
  if (node.kind === "series_ref") {
    out.add(node.name);
    return;
  }
  if (node.kind === "unary") {
    collectSeriesRefs(node.arg, out);
    return;
  }
  if (node.kind === "binary") {
    collectSeriesRefs(node.left, out);
    collectSeriesRefs(node.right, out);
    return;
  }
  if (node.kind === "call") {
    for (const x of node.args) collectSeriesRefs(x, out);
    for (const k of Object.keys(node.kwargs)) collectSeriesRefs(node.kwargs[k]!, out);
  }
}

function grainCompatibleBinary(
  left: NodeAnnotation,
  right: NodeAnnotation,
  op: string,
): { ok: boolean; out: GrainKind; lineageLeft?: string | null; lineageRight?: string | null; indexLeft?: string | null; indexRight?: string | null } {
  const isArith = "+-*/^".includes(op);
  const isCmp = ["=", "!=", "<", ">", "<=", ">="].includes(op);
  const isConcat = op === "&";

  if (isCmp || isConcat) {
    const g: GrainKind =
      left.grainKind === "scalar" && right.grainKind === "scalar"
        ? "scalar"
        : left.grainKind !== "scalar" && right.grainKind === "scalar"
          ? left.grainKind
          : left.grainKind === "scalar" && right.grainKind !== "scalar"
            ? right.grainKind
            : left.grainKind === right.grainKind
              ? left.grainKind
              : "row";
    return { ok: left.grainKind === right.grainKind || left.grainKind === "scalar" || right.grainKind === "scalar", out: g, lineageLeft: left.rootDatasetImportId, lineageRight: right.rootDatasetImportId, indexLeft: left.alignedIndexId, indexRight: right.alignedIndexId };
  }

  if (!isArith) return { ok: true, out: "scalar" };

  if (left.grainKind === "scalar" && right.grainKind === "scalar") return { ok: true, out: "scalar" };
  if (left.grainKind === "scalar" || right.grainKind === "scalar") {
    const non = left.grainKind === "scalar" ? right : left;
    return { ok: true, out: non.grainKind, lineageLeft: left.rootDatasetImportId, lineageRight: right.rootDatasetImportId, indexLeft: left.alignedIndexId, indexRight: right.alignedIndexId };
  }
  if (left.grainKind === "row" && right.grainKind === "row") {
    const ok =
      left.rootDatasetImportId === right.rootDatasetImportId ||
      left.rootDatasetImportId == null ||
      right.rootDatasetImportId == null;
    return { ok, out: "row", lineageLeft: left.rootDatasetImportId, lineageRight: right.rootDatasetImportId };
  }
  if (left.grainKind === "index" && right.grainKind === "index") {
    const ok = left.alignedIndexId === right.alignedIndexId || left.alignedIndexId == null || right.alignedIndexId == null;
    return { ok, out: "index", indexLeft: left.alignedIndexId, indexRight: right.alignedIndexId };
  }
  return { ok: false, out: "row" };
}

export type { FormulaValidationContext } from "./contracts";

export function validateFormula(
  formulaText: string,
  ctx: FormulaValidationContext,
): ValidationResult {
  const diagnostics: Diagnostic[] = [];
  const referencedSeriesNames: string[] = [];

  const parsed = parseFormula(formulaText);
  if (!parsed.ok) {
    diagnostics.push({
      code: "parse_error",
      severity: "error",
      message: parsed.error,
      offset: parsed.offset,
    });
    return { root: null, diagnostics, referencedSeriesNames };
  }

  const refs = new Set<string>();
  collectSeriesRefs(parsed.ast, refs);
  for (const name of refs) referencedSeriesNames.push(name);

  for (const name of refs) {
    if (!ctx.seriesByName.has(name)) {
      diagnostics.push({
        code: "unknown_series",
        severity: "error",
        message: `Unknown series: [${name}]`,
      });
    }
  }

  const root = annotateNode(parsed.ast, ctx, false, diagnostics);
  return { root, diagnostics, referencedSeriesNames };
}

function getMeta(ctx: FormulaValidationContext, name: string): SeriesSemanticMeta | undefined {
  return ctx.seriesByName.get(name);
}

function annotateNode(
  node: ExprNode,
  ctx: FormulaValidationContext,
  insideGrainBridge: boolean,
  diagnostics: Diagnostic[],
): AnnotatedExprNode {
  switch (node.kind) {
    case "literal": {
      const vt =
        node.value === null
          ? "unknown"
          : typeof node.value === "number"
            ? "numeric"
            : typeof node.value === "boolean"
              ? "boolean"
              : "text";
      const ann: NodeAnnotation = {
        valueType: vt,
        grainKind: "scalar",
        nullable: node.value === null,
        errorCodes: [],
      };
      return { node, ann };
    }
    case "series_ref": {
      const meta = getMeta(ctx, node.name);
      if (!meta) {
        const ann = mergeAnn(emptyAnn(), ["unknown_series"]);
        return { node, ann };
      }
      const ann: NodeAnnotation = {
        valueType: meta.valueType,
        grainKind: meta.grainKind,
        rootDatasetImportId: meta.rootDatasetImportId,
        alignedIndexId: meta.alignedIndexId,
        nullable: true,
        errorCodes: [],
      };
      return { node, ann };
    }
    case "unary": {
      const arg = annotateNode(node.arg, ctx, insideGrainBridge, diagnostics);
      const ann: NodeAnnotation = {
        ...arg.ann,
        valueType: node.op === "NOT" ? "boolean" : arg.ann.valueType,
      };
      return { node, ann, children: [arg] };
    }
    case "binary": {
      const left = annotateNode(node.left, ctx, insideGrainBridge, diagnostics);
      const right = annotateNode(node.right, ctx, insideGrainBridge, diagnostics);
      const compat = grainCompatibleBinary(left.ann, right.ann, node.op);
      let errorCodes = [...left.ann.errorCodes, ...right.ann.errorCodes];
      if (!compat.ok && !insideGrainBridge) {
        diagnostics.push({
          code: "grain_mismatch",
          severity: "error",
          message:
            "Cannot combine these grain kinds outside a function that bridges row and index (e.g. a `_BY` aggregate).",
        });
        errorCodes = [...errorCodes, "grain_mismatch"];
      }
      if (
        left.ann.grainKind === "row" &&
        right.ann.grainKind === "row" &&
        compat.lineageLeft != null &&
        compat.lineageRight != null &&
        compat.lineageLeft !== compat.lineageRight
      ) {
        diagnostics.push({
          code: "lineage_mismatch",
          severity: "error",
          message: "Series belong to different dataset lineages.",
        });
        errorCodes = [...errorCodes, "lineage_mismatch"];
      }
      if (
        left.ann.grainKind === "index" &&
        right.ann.grainKind === "index" &&
        compat.indexLeft != null &&
        compat.indexRight != null &&
        compat.indexLeft !== compat.indexRight
      ) {
        diagnostics.push({
          code: "index_alignment",
          severity: "error",
          message: "Index-grain series are aligned to different indexes.",
        });
        errorCodes = [...errorCodes, "index_alignment"];
      }
      const cmp = ["=", "!=", "<", ">", "<=", ">="].includes(node.op);
      const ann: NodeAnnotation = {
        valueType: cmp ? "boolean" : node.op === "&" ? "text" : "numeric",
        grainKind: compat.out,
        rootDatasetImportId:
          compat.out === "row"
            ? left.ann.rootDatasetImportId ?? right.ann.rootDatasetImportId
            : undefined,
        alignedIndexId:
          compat.out === "index"
            ? left.ann.alignedIndexId ?? right.ann.alignedIndexId
            : undefined,
        nullable: true,
        errorCodes,
      };
      return { node, ann, children: [left, right] };
    }
    case "call": {
      return annotateCall(node, ctx, diagnostics);
    }
  }
}

function annotateCall(
  node: ExprNode & { kind: "call" },
  ctx: FormulaValidationContext,
  diagnostics: Diagnostic[],
): AnnotatedExprNode {
  const spec = getFunctionSpec(node.fn);
  if (!spec) {
    diagnostics.push({
      code: "unknown_function",
      severity: "error",
      message: `Unknown function: ${node.fn}`,
    });
    const children = node.args.map((a) => annotateNode(a, ctx, false, diagnostics));
    for (const k of Object.keys(node.kwargs)) {
      children.push(annotateNode(node.kwargs[k]!, ctx, false, diagnostics));
    }
    return {
      node,
      ann: mergeAnn(emptyAnn(), ["unknown_function"]),
      children,
    };
  }

  const merged = mergeCallArguments(spec, node.args, node.kwargs);
  if (merged.error) {
    diagnostics.push({ code: "bad_arity", severity: "error", message: merged.error });
  }

  const bridge = Boolean(spec.bridgesGrain);
  const children: AnnotatedExprNode[] = [];

  for (const k of Object.keys(merged.map)) {
    if (!isKnownParamKey(spec, k)) {
      diagnostics.push({
        code: "bad_kwarg",
        severity: "error",
        message: `Unknown parameter ${k} for ${spec.fn}`,
      });
    }
  }

  if (spec.fn === "IF") {
    const c = merged.map["condition"];
    const t = merged.map["trueExpr"];
    const f = merged.map["falseExpr"];
    if (c && t && f) {
      const ac = annotateNode(c, ctx, bridge, diagnostics);
      const at = annotateNode(t, ctx, bridge, diagnostics);
      const af = annotateNode(f, ctx, bridge, diagnostics);
      const grain =
        ac.ann.grainKind !== "scalar"
          ? ac.ann.grainKind
          : at.ann.grainKind !== "scalar"
            ? at.ann.grainKind
            : af.ann.grainKind;
      const ann: NodeAnnotation = {
        valueType: at.ann.valueType,
        grainKind: grain,
        rootDatasetImportId: at.ann.rootDatasetImportId ?? af.ann.rootDatasetImportId,
        alignedIndexId: at.ann.alignedIndexId ?? af.ann.alignedIndexId,
        nullable: true,
        errorCodes: [],
      };
      return { node, ann, children: [ac, at, af] };
    }
  }

  for (const [key, ex] of Object.entries(merged.map)) {
    const a = annotateNode(ex, ctx, bridge, diagnostics);
    children.push(a);
    if (key === "where" && a.ann.grainKind === "index") {
      diagnostics.push({ code: "where_grain", severity: "error", message: WHERE_MSG });
    }
  }

  const ann: NodeAnnotation = {
    valueType: inferOutputValueType(spec.fn),
    grainKind: spec.outputGrain,
    nullable: true,
    errorCodes: [],
  };

  if (bridge && spec.fn.endsWith("_BY")) {
    const idxArg = merged.map["index"];
    if (idxArg?.kind === "series_ref") {
      const m = getMeta(ctx, idxArg.name);
      if (m && m.grainKind !== "index") {
        diagnostics.push({
          code: "grain_mismatch",
          severity: "error",
          message: "Second argument to _BY must be an index-grain series.",
        });
      }
      if (m?.roleKind === "index" && !m.indexSourceSeriesId) {
        diagnostics.push({
          code: "grain_mismatch",
          severity: "warning",
          message:
            "Index series should declare index_source_series_id so the engine can group rows.",
        });
      }
    }
  }

  return { node, ann, children };
}

function inferOutputValueType(fn: string): NodeAnnotation["valueType"] {
  if (fn.startsWith("COUNT")) return "numeric";
  if (fn === "LEN") return "numeric";
  if (["SUM", "AVG", "MEDIAN", "MIN", "MAX", "PERCENTILE"].includes(fn)) return "numeric";
  if (fn.endsWith("_BY")) return "numeric";
  return "unknown";
}
