/**
 * Percentiles using **linear interpolation** in **sorted** order.
 * For `n` values, uses rank `(p/100) * (n - 1)` so `p === 0` is the minimum,
 * `p === 100` is the maximum, and `p === 50` matches the usual median (e.g. for
 * `n === 6`, the average of the 3rd and 4th smallest values).
 */

function clampPercent(p: number): number {
  return Math.min(100, Math.max(0, p));
}

/**
 * @param sorted Ascending sorted finite numbers (same array is not mutated).
 * @param p Percentile in [0, 100].
 */
export function percentileLinear(sorted: readonly number[], p: number): number | null {
  const n = sorted.length;
  if (n === 0) return null;
  if (n === 1) return sorted[0]!;

  const pc = clampPercent(p);
  const rank = (pc / 100) * (n - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo]!;
  return sorted[lo]! + (rank - lo) * (sorted[hi]! - sorted[lo]!);
}

/** Median = 50th percentile with the same linear interpolation rule. */
export function medianLinear(sorted: readonly number[]): number | null {
  return percentileLinear(sorted, 50);
}

/** Sorts a copy ascending, then applies {@link percentileLinear}. */
export function percentileFromValues(values: readonly number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return percentileLinear(sorted, p);
}
