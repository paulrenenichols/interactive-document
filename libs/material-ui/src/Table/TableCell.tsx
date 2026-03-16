import * as React from 'react';

type TableCellBaseProps = {
  children?: React.ReactNode;
  /** Scope for th (column vs row) */
  scope?: 'col' | 'row';
  /** Align content */
  align?: 'left' | 'center' | 'right';
  /** Render as header cell */
  variant?: 'body' | 'head';
};

export type TableCellProps = TableCellBaseProps &
  (
    | React.TdHTMLAttributes<HTMLTableCellElement>
    | (React.ThHTMLAttributes<HTMLTableHeaderCellElement> & { variant: 'head' })
  );

export const TableCell = React.forwardRef<
  HTMLTableCellElement | HTMLTableHeaderCellElement,
  TableCellProps
>(({ scope, align = 'left', variant = 'body', className = '', children, ...props }, ref) => {
  const alignClass =
    align === 'center'
      ? 'text-center'
      : align === 'right'
        ? 'text-right'
        : 'text-left';
  const classes = [
    'px-4 text-text-primary dark:text-text-primary',
    variant === 'head' && 'font-medium',
    alignClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  if (variant === 'head') {
    return (
      <th
        ref={ref as React.Ref<HTMLTableHeaderCellElement>}
        scope={scope ?? 'col'}
        className={classes}
        {...(props as React.ThHTMLAttributes<HTMLTableHeaderCellElement>)}
      >
        {children}
      </th>
    );
  }
  return (
    <td
      ref={ref as React.Ref<HTMLTableCellElement>}
      className={classes}
      {...(props as React.TdHTMLAttributes<HTMLTableCellElement>)}
    >
      {children}
    </td>
  );
});

TableCell.displayName = 'TableCell';
