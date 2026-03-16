import * as React from 'react';

export type FABSize = 'small' | 'medium' | 'large';
export type FABVariant = 'surface' | 'primary' | 'secondary' | 'tertiary';

export interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** small (40px), medium (56px), large (96px) */
  size?: FABSize;
  /** M3 FAB: surface (default), primary, secondary, tertiary */
  variant?: FABVariant;
  /** Extended FAB with label (icon + text) */
  extended?: boolean;
  children: React.ReactNode;
  className?: string;
}

const sizeClasses: Record<FABSize, string> = {
  small: 'h-10 min-w-10 rounded-radius-large gap-2 px-3',
  medium: 'h-14 min-w-14 rounded-radius-large gap-3 px-4',
  large: 'h-24 min-w-24 rounded-radius-extra-large gap-4 px-6',
};

const iconOnlySizeClasses: Record<FABSize, string> = {
  small: 'h-10 w-10 rounded-radius-large',
  medium: 'h-14 w-14 rounded-radius-large',
  large: 'h-24 w-24 rounded-radius-extra-large',
};

const variantClasses: Record<FABVariant, string> = {
  surface:
    'bg-bg-secondary dark:bg-bg-secondary text-text-primary dark:text-text-primary shadow-md hover:bg-bg-secondary/80 dark:hover:bg-bg-secondary/80',
  primary:
    'bg-accent-primary dark:bg-accent-primary text-white shadow-md hover:bg-accent-primary-hover dark:hover:bg-accent-primary-hover',
  secondary:
    'bg-accent-primary/10 dark:bg-accent-primary/20 text-accent-primary dark:text-accent-primary shadow-md hover:bg-accent-primary/20 dark:hover:bg-accent-primary/30',
  tertiary:
    'bg-transparent text-accent-primary dark:text-accent-primary shadow-md hover:bg-accent-primary/10 dark:hover:bg-accent-primary/20',
};

export const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  (
    {
      size = 'medium',
      variant = 'surface',
      extended = false,
      disabled = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-medium transition-colors duration-[150ms] focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    const sizeClass = extended ? sizeClasses[size] : iconOnlySizeClasses[size];
    const variantClass = variantClasses[variant];

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={`${base} ${sizeClass} ${variantClass} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  }
);

FAB.displayName = 'FAB';
