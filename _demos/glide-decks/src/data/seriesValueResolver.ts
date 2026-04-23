import { buildSeedValuesForSeries } from "../fixtures/seriesGridSeedValues";
import type { DataSeriesAssetRow } from "../types/dataModel";

/** Resolves display/cell strings for a catalog row (project columns or synthetic seeds). */
export type SeriesValueResolver = (row: DataSeriesAssetRow) => string[];

export function createFixtureSeriesValueResolver(): SeriesValueResolver {
  return (row) => buildSeedValuesForSeries(row);
}

export function createProjectSeriesValueResolver(
  valuesBySeriesName: ReadonlyMap<string, readonly string[]>,
): SeriesValueResolver {
  return (row: DataSeriesAssetRow) => {
    const v = valuesBySeriesName.get(row.name);
    if (v != null) {
      return v.slice();
    }
    return buildSeedValuesForSeries(row);
  };
}
