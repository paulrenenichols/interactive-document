import * as React from 'react';

export interface RatingProps {
  /** Current value (controlled). Can be number or half (e.g. 2.5). */
  value?: number | null;
  /** Default value (uncontrolled) */
  defaultValue?: number | null;
  /** Max rating (e.g. 5 for 5 stars) */
  max?: number;
  /** Allow half stars */
  precision?: 0.5 | 1;
  /** Callback when value changes */
  onChange?: (value: number | null) => void;
  /** Read-only (no hover/click) */
  readOnly?: boolean;
  disabled?: boolean;
  /** Custom icon (default: star) */
  icon?: React.ReactNode;
  /** Icon when empty (default: star outline) */
  emptyIcon?: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const defaultIcon = (
  <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const defaultEmptyIcon = (
  <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
  </svg>
);

const sizeClasses = {
  small: 'w-5 h-5',
  medium: 'w-8 h-8',
  large: 'w-10 h-10',
};

export const Rating = React.forwardRef<HTMLSpanElement, RatingProps>(
  (
    {
      value: valueProp,
      defaultValue = null,
      max = 5,
      precision = 1,
      onChange,
      readOnly = false,
      disabled = false,
      icon = defaultIcon,
      emptyIcon = defaultEmptyIcon,
      className = '',
      size = 'medium',
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<number | null>(
      () => valueProp ?? defaultValue
    );
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : internalValue;
    const displayValue = hoverValue ?? value;
    const isInteractive = !readOnly && !disabled;

    const update = (next: number | null) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    };

    const sizeClass = sizeClasses[size];
    const iconColor =
      'text-warning dark:text-warning'; /* use theme --color-warning or a muted for empty */
    const emptyColor = 'text-text-muted dark:text-text-muted';

    return (
      <span
        ref={ref}
        role={readOnly ? 'img' : 'slider'}
        aria-label={readOnly ? `Rating ${value ?? 0} out of ${max}` : undefined}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value ?? 0}
        aria-readonly={readOnly}
        aria-disabled={disabled}
        className={`inline-flex items-center gap-0.5 ${className}`.trim()}
      >
        {Array.from({ length: max }, (_, i) => {
          const idx = i + 1;
          let fill = 0;
          if (displayValue !== null) {
            if (displayValue >= idx) fill = 1;
            else if (precision === 0.5 && displayValue > idx - 1) fill = 0.5;
          }
          return (
            <span
              key={idx}
              className={`relative inline-flex shrink-0 ${sizeClass} ${isInteractive ? 'cursor-pointer' : ''}`}
              onMouseEnter={() => isInteractive && setHoverValue(idx)}
              onMouseLeave={() => isInteractive && setHoverValue(null)}
              onClick={() => isInteractive && update(value === idx ? null : idx)}
            >
              <span className={`${fill >= 1 ? iconColor : emptyColor}`}>
                {fill >= 1 ? icon : emptyIcon}
              </span>
              {fill === 0.5 && (
                <span
                  className="absolute inset-0 overflow-hidden text-warning dark:text-warning"
                  style={{ width: '50%' }}
                >
                  {icon}
                </span>
              )}
            </span>
          );
        })}
      </span>
    );
  }
);

Rating.displayName = 'Rating';
