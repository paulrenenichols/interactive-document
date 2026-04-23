import type { ChartAssetRow } from "../types/dataModel";

export function getChartById(rows: readonly ChartAssetRow[], id: string): ChartAssetRow | undefined {
  return rows.find((r) => r.id === id);
}

export function getChartByName(rows: readonly ChartAssetRow[], name: string): ChartAssetRow | undefined {
  return rows.find((r) => r.name === name);
}
