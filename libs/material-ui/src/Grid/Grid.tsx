import * as React from 'react';

const gridColsMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
};

const gridRowsMap: Record<number, string> = {
  1: 'grid-rows-1',
  2: 'grid-rows-2',
  3: 'grid-rows-3',
  4: 'grid-rows-4',
  5: 'grid-rows-5',
  6: 'grid-rows-6',
};

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** Number of columns (1–12 or 'auto') */
  columns?: number | 'auto';
  /** Number of rows (optional; default auto flow) */
  rows?: number | 'auto';
  /** Gap between items (8px base unit) */
  spacing?: number;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      columns = 12,
      rows,
      spacing = 1,
      className = '',
      children,
      style,
      ...props
    },
    ref
  ) => {
    const gap = spacing * 8;
    const colsClass =
      columns === 'auto'
        ? 'grid-cols-[repeat(auto-fill,minmax(0,1fr))]'
        : gridColsMap[typeof columns === 'number' ? columns : 12] ?? 'grid-cols-12';
    const rowsClass =
      rows != null &&
      typeof rows === 'number' &&
      gridRowsMap[rows] != null
        ? gridRowsMap[rows]
        : '';
    const classes = ['grid', colsClass, rowsClass, className].filter(Boolean).join(' ');
    return (
      <div
        ref={ref}
        className={classes}
        style={{ gap: `${gap}px`, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';
