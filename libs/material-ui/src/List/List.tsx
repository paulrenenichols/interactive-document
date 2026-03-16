import * as React from 'react';

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  children?: React.ReactNode;
  /** Dense (reduced padding) */
  dense?: boolean;
}

export const List = React.forwardRef<HTMLUListElement, ListProps>(
  ({ dense = false, className = '', children, ...props }, ref) => {
    const classes = [
      'list-none m-0 p-0',
      dense ? '[&>li]:py-1.5' : '[&>li]:py-2',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <ul ref={ref} className={classes} role="list" {...props}>
        {children}
      </ul>
    );
  }
);

List.displayName = 'List';
