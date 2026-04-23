import type { ExprNode, FunctionSpec } from "./contracts";

export function mergeCallArguments(
  spec: FunctionSpec,
  args: ExprNode[],
  kwargs: Record<string, ExprNode>,
): { map: Record<string, ExprNode>; error?: string } {
  const map: Record<string, ExprNode> = { ...kwargs };
  const params = spec.params;
  const variadic =
    spec.fn === "AND" ||
    spec.fn === "OR" ||
    spec.fn === "COALESCE" ||
    spec.fn === "IN" ||
    spec.fn === "CONCAT";

  if (variadic) {
    if (spec.fn === "IN") {
      if (args.length < 2) return { map, error: "IN requires at least two arguments" };
      map["value"] = args[0]!;
      for (let i = 1; i < args.length; i++) map[`opt${i}`] = args[i]!;
      return { map };
    }
    for (let i = 0; i < args.length; i++) map[`arg${i}`] = args[i]!;
    return { map };
  }

  let pos = 0;
  for (let pi = 0; pi < params.length; pi++) {
    const p = params[pi]!;
    if (map[p.name] !== undefined) continue;
    if (pos < args.length) {
      map[p.name] = args[pos]!;
      pos++;
    }
  }

  if (pos < args.length) {
    return { map, error: `Too many positional arguments for ${spec.fn}` };
  }

  for (const p of params) {
    if (!p.optional && map[p.name] === undefined) {
      return { map, error: `Missing required argument ${p.name} for ${spec.fn}` };
    }
  }

  return { map };
}

export function isKnownParamKey(spec: FunctionSpec, k: string): boolean {
  if (spec.params.some((p) => p.name === k)) return true;
  if (spec.fn === "IN" && /^opt\d+$/.test(k)) return true;
  if (
    (spec.fn === "AND" || spec.fn === "OR" || spec.fn === "COALESCE" || spec.fn === "CONCAT") &&
    /^arg\d+$/.test(k)
  ) {
    return true;
  }
  return false;
}
