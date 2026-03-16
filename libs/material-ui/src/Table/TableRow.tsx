import * as React from 'react';

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children?: React.ReactNode;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className = '', children, ...props }, ref) => (
    <tr
      ref={ref}
      className={`border-b border-border-default dark:border-border-default hover:bg-bg-secondary/50 dark:hover:bg-bg-secondary/50 transition-colors ${className}`.trim()}
      {...props}
    >
      {children}
    </tr>
  )
);

TableRow.displayName = 'TableRow';
