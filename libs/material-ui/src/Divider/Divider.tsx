import * as React from 'react';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** For vertical: optional height (e.g. '100%') */
  flexItem?: boolean;
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      flexItem = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const isVertical = orientation === 'vertical';
    const classes = [
      'border-0',
      isVertical
        ? 'w-px border-l border-border-default dark:border-border-default self-stretch'
        : 'h-px border-t border-border-default dark:border-border-default',
      flexItem && isVertical ? 'flex-shrink-0' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return <hr ref={ref} role="separator" className={classes} {...props} />;
  }
);

Divider.displayName = 'Divider';
