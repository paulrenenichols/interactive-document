'use client';

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  type TooltipProps,
} from 'recharts';
import type { ChartConfig } from './BarChart';

type PieChartTooltipProps = TooltipProps<number, string> & {
  rowDataKeys?: string[];
};

function PieChartTooltip({
  active,
  payload,
  rowDataKeys = [],
}: PieChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const rowData = (item.payload as Record<string, unknown>)?._row as Record<string, unknown> | undefined;
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
      <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
        {item.name}
      </div>
      <div style={{ color: item.payload?.color ?? 'var(--text-primary)' }}>
        {typeof item.value === 'number' ? item.value.toLocaleString() : String(item.value)}
      </div>
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

export type PieChartProps = {
  data: Record<string, unknown>[];
  config: ChartConfig;
  width?: number | string;
  height?: number | string;
};

export function PieChart({ data, config, width = '100%', height = 300 }: PieChartProps) {
  const { categoryKey, valueKey } = config;

  const chartData = data.map((row, i) => {
    const category = row[categoryKey];
    const value = row[valueKey];
    return {
      ...row,
      name: category != null ? String(category) : '',
      value: typeof value === 'number' ? value : Number(value) || 0,
      _row: row,
      color: CHART_COLORS[i % CHART_COLORS.length],
    };
  });

  const rowDataKeys = data[0] ? Object.keys(data[0]) : [];

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsPieChart aria-label="Pie chart">
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius="70%"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={{ stroke: 'var(--text-secondary)' }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color ?? CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<PieChartTooltip rowDataKeys={rowDataKeys} />} />
        <Legend
          wrapperStyle={{ fontSize: '0.75rem' }}
          formatter={(value) => value}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
