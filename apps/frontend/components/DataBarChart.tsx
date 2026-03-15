'use client';

import {
  useDataSourceRows,
  useDataSourceRowsSync,
  type DataRow,
} from '@/lib/queries';
import { BarChart, type ChartConfig } from './BarChart';

export type DataBarChartProps = {
  dataSourceId: string | undefined;
  config: ChartConfig;
  width?: number | string;
  height?: number | string;
  /** When viewing with a share link, pass the token so chart data can be fetched. */
  shareToken?: string | null;
};

function rowDataToRecords(rows: DataRow[]): Record<string, unknown>[] {
  return rows.map((r) => r.row_data);
}

export function DataBarChart({
  dataSourceId,
  config,
  width = '100%',
  height = 300,
  shareToken,
}: DataBarChartProps) {
  const fromApi = useDataSourceRows(
    dataSourceId,
    undefined,
    undefined,
    { shareToken }
  );
  const fromSync = useDataSourceRowsSync(shareToken ? undefined : dataSourceId);
  const { data, isLoading, isError, error } = shareToken ? fromApi : fromSync;

  if (isLoading) {
    return (
      <div
        style={{
          width,
          height: typeof height === 'number' ? `${height}px` : height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 8,
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
        }}
      >
        Loading chart data…
      </div>
    );
  }

  if (isError) {
    return (
      <div
        style={{
          width,
          height: typeof height === 'number' ? `${height}px` : height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 8,
          color: 'var(--error)',
          fontSize: '0.875rem',
          padding: 16,
          textAlign: 'center',
        }}
      >
        {error instanceof Error ? error.message : 'Failed to load chart data'}
      </div>
    );
  }

  const rows = data?.rows ?? [];
  const chartData = rowDataToRecords(rows);

  if (chartData.length === 0) {
    return (
      <div
        style={{
          width,
          height: typeof height === 'number' ? `${height}px` : height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 8,
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        No data to display
      </div>
    );
  }

  return (
    <BarChart data={chartData} config={config} width={width} height={height} />
  );
}
