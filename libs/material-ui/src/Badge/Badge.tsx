import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  /** Badge content (e.g. count) */
  badgeContent?: React.ReactNode;
  /** Hide badge when badgeContent is 0 */
  showZero?: boolean;
  /** Dot only, no content */
  variant?: 'standard' | 'dot';
  /** Color variant */
  color?: 'default' | 'primary' | 'error';
}

const colorMap = {
  default: 'bg-text-muted dark:bg-text-muted text-bg-primary dark:text-bg-primary',
  primary: 'bg-accent-primary dark:bg-accent-primary text-white',
  error: 'bg-accent-destructive dark:bg-accent-destructive text-white',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      badgeContent = 0,
      showZero = false,
      variant = 'standard',
      color = 'default',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const show =
      variant === 'dot' ||
      (badgeContent !== undefined && badgeContent !== null && (showZero || badgeContent !== 0));
    const colorClass = colorMap[color];
    return (
      <span ref={ref} className={`relative inline-flex ${className}`.trim()} {...props}>
        {children}
        {show && (
          <span
            className={
              variant === 'dot'
                ? `absolute -top-0.5 -right-0.5 h-2 w-2 rounded-radius-full border-2 border-bg-primary dark:border-bg-primary ${colorClass}`
                : `absolute -top-1 -right-1 min-w-[1rem] h-4 px-1 rounded-radius-full text-[0.65rem] font-medium flex items-center justify-center ${colorClass}`
            }
          >
            {variant === 'standard' ? badgeContent : null}
          </span>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
