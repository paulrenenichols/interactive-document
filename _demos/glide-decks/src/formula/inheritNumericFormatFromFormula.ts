import type { DataSeriesAssetRow } from "../types/dataModel";
import type { ExprNode } from "./contracts";
import { getFunctionSpec, normalizeLeadingEquals } from "./contracts";
import { parseFormula } from "./parseFormula";

function findFirstCallNodePreorder(node: ExprNode): Extract<ExprNode, { kind: "call" }> | null {
  if (node.kind === "call") return node;
  if (node.kind === "unary") return findFirstCallNodePreorder(node.arg);
  if (node.kind === "binary") {
    return findFirstCallNodePreorder(node.left) ?? findFirstCallNodePreorder(node.right);
  }
  return null;
}

function valuesPositionalIndex(fnUpper: string): number | null {
  const spec = getFunctionSpec(fnUpper);
  if (!spec) return null;
  const i = spec.params.findIndex((p) => p.name === "values" && !p.isWhere);
  return i >= 0 ? i : null;
}

function catalogByName(rows: readonly DataSeriesAssetRow[]): Map<string, DataSeriesAssetRow> {
  const m = new Map<string, DataSeriesAssetRow>();
  for (const r of rows) {
    m.set(r.name, r);
  }
  return m;
}

/**
 * If the formula's primary (preorder-first) call has a `values` parameter that is a series reference,
 * returns that referenced numeric series' `numeric_format` when set; otherwise `null`.
 */
export function inheritNumericFormatFromFormula(
  rawFormula: string,
  catalog: readonly DataSeriesAssetRow[],
): string | null {
  const trimmed = normalizeLeadingEquals(rawFormula).trim();
  if (!trimmed) return null;

  const parsed = parseFormula(trimmed);
  if (!parsed.ok) return null;

  const call = findFirstCallNodePreorder(parsed.ast);
  if (!call) return null;

  const vi = valuesPositionalIndex(call.fn);
  if (vi == null) return null;

  const arg = call.args[vi];
  if (!arg || arg.kind !== "series_ref") return null;

  const byName = catalogByName(catalog);
  const parent = byName.get(arg.name);
  if (!parent || parent.value_type !== "numeric") return null;

  const fmt = parent.numeric_format?.trim();
  return fmt ? fmt : null;
}
