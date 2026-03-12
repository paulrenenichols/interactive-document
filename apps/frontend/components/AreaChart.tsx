'use client';

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  type TooltipProps,
} from 'recharts';
import type { ChartConfig } from './BarChart';

type AreaChartTooltipProps = TooltipProps<number, string> & {
  rowDataKeys?: string[];
};

function AreaChartTooltip({
  active,
  payload,
  label,
  rowDataKeys = [],
}: AreaChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const chartPayload = payload[0]?.payload as Record<string, unknown> | undefined;
  const rowData = (chartPayload?._row as Record<string, unknown>) ?? chartPayload;
  const displayKeys = rowDataKeys.length > 0 ? rowDataKeys : (rowData ? Object.keys(rowData).filter((k) => !k.startsWith('_')) : []);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        padding: '8px 12px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-default)',
        borderRadius: 6,
        fontSize: '0.875rem',
        color: 'var(--text-primary)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {label != null && (
        <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
          {String(label)}
        </div>
      )}
      {payload.map((p) => (
        <div key={p.dataKey ?? p.name} style={{ color: p.color ?? 'var(--text-primary)' }}>
          {p.name ?? p.dataKey}: {typeof p.value === 'number' ? p.value.toLocaleString() : String(p.value)}
        </div>
      ))}
      {rowData && displayKeys.length > 0 && (
        <div
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: '1px solid var(--border-default)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}
        >
          {displayKeys
            .filter((k) => !['name', 'value', '_row', '_rows'].includes(k))
            .slice(0, 6)
            .map((k) => (
              <div key={k}>
                {k}: {String(rowData[k] ?? '—')}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

const CHART_COLORS = [
  'var(--chart-series-1)',
  'var(--chart-series-2)',
  'var(--chart-series-3)',
  'var(--chart-series-4)',
  'var(--chart-series-5)',
  'var(--chart-series-6)',
];

function pivotBySeries(
  rows: Record<string, unknown>[],
  categoryKey: string,
  valueKey: string,
  seriesKey: string
): Record<string, unknown>[] {
  const byCategory = new Map<string, Record<string, unknown>>();

  for (const row of rows) {
    const cat = row[categoryKey] != null ? String(row[categoryKey]) : '';
    const val = typeof row[valueKey] === 'number' ? row[valueKey] : Number(row[valueKey]) || 0;
    const series = row[seriesKey] != null ? String(row[seriesKey]) : '';

    if (!byCategory.has(cat)) {
      byCategory.set(cat, { name: cat, _row: row });
    }
    const entry = byCategory.get(cat)!;
    entry[series] = val;
  }

  return Array.from(byCategory.values());
}

export type AreaChartProps = {
  data: Record<string, unknown>[];
  config: ChartConfig;
  width?: number | string;
  height?: number | string;
};

export function AreaChart({ data, config, width = '100%', height = 300 }: AreaChartProps) {
  const { categoryKey, valueKey, seriesKey } = config;

  const hasSeries = !!seriesKey;
  const chartData =
    hasSeries && seriesKey
      ? pivotBySeries(data, categoryKey, valueKey, seriesKey)
      : data.map((row) => {
          const category = row[categoryKey];
          const value = row[valueKey];
          return {
            ...row,
            name: category != null ? String(category) : '',
            value: typeof value === 'number' ? value : Number(value) || 0,
          };
        });

  const uniqueSeries =
    hasSeries && seriesKey
      ? Array.from(new Set(data.map((r) => r[seriesKey]).filter(Boolean).map(String)))
      : [valueKey];

  const rowDataKeys = data[0] ? Object.keys(data[0]) : [];

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsAreaChart
        data={chartData}
        margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
        aria-label="Area chart"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
        <XAxis
          dataKey="name"
          stroke="var(--text-secondary)"
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          tickLine={{ stroke: 'var(--border-default)' }}
          axisLine={{ stroke: 'var(--border-default)' }}
        />
        <YAxis
          stroke="var(--text-secondary)"
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          tickLine={{ stroke: 'var(--border-default)' }}
          axisLine={{ stroke: 'var(--border-default)' }}
          tickFormatter={(v: number) => v.toLocaleString()}
        />
        <Tooltip
          content={<AreaChartTooltip rowDataKeys={rowDataKeys} />}
          cursor={{ stroke: 'var(--border-default)' }}
        />
        {hasSeries && (
          <Legend
            wrapperStyle={{ fontSize: '0.75rem' }}
            formatter={(value) => value}
            iconType="line"
            iconSize={8}
          />
        )}
        {hasSeries
          ? uniqueSeries.map((seriesVal, i) => (
              <Area
                key={seriesVal}
                type="monotone"
                dataKey={seriesVal}
                name={seriesVal}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                fillOpacity={0.5}
                strokeWidth={2}
              />
            ))
          : (
              <Area
                type="monotone"
                dataKey="value"
                name={valueKey}
                stroke={CHART_COLORS[0]}
                fill={CHART_COLORS[0]}
                fillOpacity={0.5}
                strokeWidth={2}
              />
            )}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
