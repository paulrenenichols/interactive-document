import * as React from 'react';

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Horizontal (default) or vertical layout */
  orientation?: 'horizontal' | 'vertical';
  /** Remove border radius between buttons for a connected look */
  connected?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      orientation = 'horizontal',
      connected = true,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const flexClass = orientation === 'vertical' ? 'flex flex-col' : 'inline-flex flex-row';
    const childClass = connected
      ? orientation === 'vertical'
        ? '[&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*]:rounded-none first:[&>*]:rounded-t-medium last:[&>*]:rounded-b-medium'
        : '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*]:rounded-none first:[&>*]:rounded-l-medium last:[&>*]:rounded-r-medium [&>*:not(:first-child)]:border-l-0'
      : '';

    return (
      <div
        ref={ref}
        role="group"
        className={`${flexClass} ${childClass} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';
