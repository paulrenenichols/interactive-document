import * as React from 'react';

export interface PaperProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export const Paper = React.forwardRef<HTMLDivElement, PaperProps>(
  (
    {
      variant = 'elevated',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const variantClass =
      variant === 'outlined'
        ? 'border border-border-default dark:border-border-default'
        : variant === 'filled'
          ? 'bg-bg-secondary dark:bg-bg-secondary'
          : 'shadow-md dark:shadow-md';
    return (
      <div
        ref={ref}
        className={`rounded-radius-medium bg-bg-primary dark:bg-bg-primary ${variantClass} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Paper.displayName = 'Paper';
