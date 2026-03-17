import * as React from 'react';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children?: React.ReactNode;
  /** Size of cells */
  size?: 'medium' | 'small';
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ size = 'medium', className = '', children, ...props }, ref) => {
    const sizeClass =
      size === 'small'
        ? '[&_th]:py-2 [&_td]:py-2 [&_th]:text-xs [&_td]:text-xs'
        : '[&_th]:py-3 [&_td]:py-3';
    const classes = [
      'w-full border-collapse',
      sizeClass,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <table ref={ref} className={classes} {...props}>
        {children}
      </table>
    );
  }
);

Table.displayName = 'Table';
