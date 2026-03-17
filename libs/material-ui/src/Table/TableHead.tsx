import * as React from 'react';

export interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode;
}

export const TableHead = React.forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ className = '', children, ...props }, ref) => (
    <thead
      ref={ref}
      className={`bg-bg-secondary dark:bg-bg-secondary ${className}`.trim()}
      {...props}
    >
      {children}
    </thead>
  )
);

TableHead.displayName = 'TableHead';
