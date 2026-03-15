import * as React from 'react';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  component?: React.ElementType;
  children?: React.ReactNode;
}

const variantToTag: Record<TypographyVariant, string> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body1: 'p',
  body2: 'p',
  caption: 'span',
  overline: 'span',
};

const variantClasses: Record<TypographyVariant, string> = {
  h1: 'text-3xl font-bold tracking-tight text-text-primary dark:text-text-primary',
  h2: 'text-2xl font-bold tracking-tight text-text-primary dark:text-text-primary',
  h3: 'text-xl font-semibold text-text-primary dark:text-text-primary',
  h4: 'text-lg font-semibold text-text-primary dark:text-text-primary',
  h5: 'text-base font-medium text-text-primary dark:text-text-primary',
  h6: 'text-sm font-medium text-text-primary dark:text-text-primary',
  body1: 'text-base text-text-primary dark:text-text-primary',
  body2: 'text-sm text-text-secondary dark:text-text-secondary',
  caption: 'text-xs text-text-muted dark:text-text-muted',
  overline:
    'text-xs font-medium uppercase tracking-wider text-text-secondary dark:text-text-secondary',
};

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    {
      variant = 'body1',
      component,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const Component = (component ?? variantToTag[variant]) as React.ElementType;
    const variantClass = variantClasses[variant];
    return (
      <Component
        ref={ref}
        className={`${variantClass} ${className}`.trim()}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';
