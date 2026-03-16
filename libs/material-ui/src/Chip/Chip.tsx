import * as React from 'react';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  variant?: 'filled' | 'outlined';
  /** Optional delete icon slot (e.g. X); onDelete preferred for accessibility */
  onDelete?: () => void;
  /** Size */
  size?: 'small' | 'medium';
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      variant = 'filled',
      size = 'medium',
      onDelete,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const variantClass =
      variant === 'outlined'
        ? 'border border-border-default dark:border-border-default bg-transparent'
        : 'bg-bg-secondary dark:bg-bg-secondary';
    const sizeClass = size === 'small' ? 'h-6 text-xs px-2' : 'h-8 text-sm px-3';
    const classes = [
      'inline-flex items-center gap-1 rounded-radius-full text-text-primary dark:text-text-primary font-medium',
      variantClass,
      sizeClass,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div ref={ref} role="presentation" className={classes} {...props}>
        <span>{children}</span>
        {onDelete != null && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded-radius-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-primary dark:focus:ring-accent-primary"
            aria-label="Remove"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Chip.displayName = 'Chip';
