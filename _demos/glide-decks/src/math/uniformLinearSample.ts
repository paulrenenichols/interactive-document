/**
 * Uniform linear downsampling in **index order** (no sort of values).
 * Indices are evenly spaced from the first to the last element, equivalent to
 * `linspace(0, n-1, k)` with rounding; if rounding collapses to fewer than `k`
 * distinct indices, missing picks are filled by scanning `0..n-1` for unused indices
 * in ascending order until `k` samples exist.
 */

/** Collects up to `k` distinct indices in [0, n-1], sorted ascending (matches series order). */
function uniformLinearIndices(n: number, k: number): number[] {
  if (n <= 0 || k <= 0) return [];
  if (k === 1) return [Math.floor((n - 1) / 2)];
  if (k >= n) return Array.from({ length: n }, (_, i) => i);

  const chosen = new Set<number>();
  for (let j = 0; j < k; j++) {
    chosen.add(Math.round((j * (n - 1)) / (k - 1)));
  }

  let ordered = [...chosen].sort((a, b) => a - b);
  if (ordered.length >= k) {
    return ordered.slice(0, k);
  }

  for (let i = 0; i < n && ordered.length < k; i++) {
    if (!chosen.has(i)) {
      chosen.add(i);
      ordered = [...chosen].sort((a, b) => a - b);
    }
  }

  return ordered;
}

/**
 * Returns up to `k` elements from `values` in **original order** (subset by increasing index).
 * If `values.length <= k`, returns a shallow copy of the full series.
 */
export function uniformLinearSample<T>(values: readonly T[], k: number): T[] {
  const n = values.length;
  if (k <= 0 || n === 0) return [];
  if (k >= n) return [...values];

  const indices = uniformLinearIndices(n, k);
  return indices.map((i) => values[i]!);
}
