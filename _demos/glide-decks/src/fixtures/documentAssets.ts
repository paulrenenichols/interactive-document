import seriesJson from "../../design/sample-data-for-ui/sample-data-series-array.json";
import chartsJson from "../../design/sample-data-for-ui/sample-chart-array.json";
import dataSourcesJson from "../../design/sample-data-for-ui/sample-data-sources-array.json";
import type {
  ChartAssetRow,
  DataSeriesAssetRow,
  DataSourceRow,
} from "../types/dataModel";

export const sampleDataSeriesRows: DataSeriesAssetRow[] =
  seriesJson as DataSeriesAssetRow[];

export const sampleChartAssetRows: ChartAssetRow[] =
  chartsJson as ChartAssetRow[];

export const sampleDataSourceRows: DataSourceRow[] =
  dataSourcesJson as DataSourceRow[];
