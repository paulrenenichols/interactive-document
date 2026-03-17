import * as React from 'react';

export interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children?: React.ReactNode;
  /** Disable padding (use when custom content has its own) */
  disablePadding?: boolean;
}

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  ({ disablePadding = false, className = '', children, ...props }, ref) => {
    const classes = [
      'px-4',
      disablePadding ? '' : 'py-2',
      'text-text-primary dark:text-text-primary',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <li ref={ref} className={classes} {...props}>
        {children}
      </li>
    );
  }
);

ListItem.displayName = 'ListItem';
