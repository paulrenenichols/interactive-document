'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDataSources, useDataSourceRows } from '@/lib/queries';
import { DataBarChart } from '@/components/DataBarChart';
import type { ChartConfig } from '@/components/BarChart';

function getColumnKeys(rows: { row_data: Record<string, unknown> }[]): string[] {
  const first = rows[0]?.row_data;
  return first ? Object.keys(first) : [];
}

export default function DevChartPage() {
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [categoryKey, setCategoryKey] = useState('');
  const [valueKey, setValueKey] = useState('');
  const [seriesKey, setSeriesKey] = useState('');

  const { data: dataSourcesData } = useDataSources();
  const { data: rowsData } = useDataSourceRows(selectedSourceId || undefined);

  const dataSources = dataSourcesData?.dataSources ?? [];
  const rows = rowsData?.rows ?? [];
  const columnKeys = useMemo(() => getColumnKeys(rows), [rows]);

  const config: ChartConfig = useMemo(
    () => ({
      categoryKey: categoryKey || (columnKeys[0] ?? ''),
      valueKey: valueKey || (columnKeys[1] ?? columnKeys[0] ?? ''),
      ...(seriesKey && { seriesKey }),
    }),
    [categoryKey, valueKey, seriesKey, columnKeys]
  );

  const hasValidConfig =
    config.categoryKey && config.valueKey && selectedSourceId;

  return (
    <main
      style={{
        padding: '2rem',
        fontFamily: 'system-ui',
        maxWidth: 960,
        margin: '0 auto',
      }}
    >
      <h1>Chart Test Page</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Select a data source and configure column mapping to test the bar chart
        with live API data.
      </p>

      <section
        style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 8,
          border: '1px solid var(--border-default)',
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Configuration</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label htmlFor="data-source" style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem' }}>
              Data source
            </label>
            <select
              id="data-source"
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              style={{
                padding: '8px 12px',
                minWidth: 200,
                border: '1px solid var(--border-default)',
                borderRadius: 4,
              }}
            >
              <option value="">— Select —</option>
              {dataSources.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name}
                </option>
              ))}
            </select>
          </div>

          {columnKeys.length > 0 && (
            <>
              <div>
                <label htmlFor="category" style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem' }}>
                  Category (X axis)
                </label>
                <select
                  id="category"
                  value={categoryKey || columnKeys[0]}
                  onChange={(e) => setCategoryKey(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    minWidth: 200,
                    border: '1px solid var(--border-default)',
                    borderRadius: 4,
                  }}
                >
                  {columnKeys.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="value" style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem' }}>
                  Value (Y axis)
                </label>
                <select
                  id="value"
                  value={valueKey || columnKeys[1] || columnKeys[0]}
                  onChange={(e) => setValueKey(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    minWidth: 200,
                    border: '1px solid var(--border-default)',
                    borderRadius: 4,
                  }}
                >
                  {columnKeys.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="series" style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem' }}>
                  Series (optional, for grouped bars)
                </label>
                <select
                  id="series"
                  value={seriesKey}
                  onChange={(e) => setSeriesKey(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    minWidth: 200,
                    border: '1px solid var(--border-default)',
                    borderRadius: 4,
                  }}
                >
                  <option value="">— None —</option>
                  {columnKeys.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </section>

      <section
        style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 8,
          border: '1px solid var(--border-default)',
          minHeight: 360,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Chart</h2>
        {hasValidConfig ? (
          <DataBarChart
            dataSourceId={selectedSourceId}
            config={config}
            height={360}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 320,
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
            }}
          >
            {!selectedSourceId
              ? 'Select a data source to view the chart.'
              : !categoryKey && !valueKey
                ? 'Loading columns…'
                : 'Configure category and value columns.'}
          </div>
        )}
      </section>

      <p style={{ marginTop: '1.5rem' }}>
        <Link href="/">Home</Link>
        {' — '}
        <Link href="/edit">Edit decks</Link>
      </p>
    </main>
  );
}
