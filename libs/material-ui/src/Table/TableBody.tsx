import * as React from 'react';

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode;
}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className = '', children, ...props }, ref) => (
    <tbody ref={ref} className={className} {...props}>
      {children}
    </tbody>
  )
);

TableBody.displayName = 'TableBody';
