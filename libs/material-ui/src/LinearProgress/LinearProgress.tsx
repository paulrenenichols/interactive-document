import * as React from 'react';

export type LinearProgressVariant = 'indeterminate' | 'determinate' | 'buffer';

export interface LinearProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: LinearProgressVariant;
  value?: number;
  valueBuffer?: number;
}

export const LinearProgress: React.FC<LinearProgressProps> = ({
  variant = 'indeterminate',
  value = 0,
  valueBuffer = 0,
  className = '',
  ...props
}) => {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const normalizedBuffer = Math.min(Math.max(valueBuffer, 0), 100);

  const primaryWidth =
    variant === 'determinate' || variant === 'buffer'
      ? `${normalizedValue}%`
      : undefined;

  const bufferWidth =
    variant === 'buffer' ? `${normalizedBuffer}%` : undefined;

  return (
    <div
      className={`relative h-1.5 w-full overflow-hidden rounded-radius-full bg-bg-secondary dark:bg-bg-secondary ${className}`.trim()}
      role="progressbar"
      aria-valuemin={variant === 'indeterminate' ? undefined : 0}
      aria-valuemax={variant === 'indeterminate' ? undefined : 100}
      aria-valuenow={variant === 'indeterminate' ? undefined : Math.round(normalizedValue)}
      {...props}
    >
      {variant === 'buffer' && (
        <div
          className="absolute inset-y-0 left-0 bg-accent-primary/40"
          style={{ width: bufferWidth }}
        />
      )}
      <div
        className={`absolute inset-y-0 left-0 bg-accent-primary ${
          variant === 'indeterminate'
            ? 'animate-[linear-indeterminate_1.5s_ease-in-out_infinite]'
            : ''
        }`.trim()}
        style={{
          width: primaryWidth,
        }}
      />
    </div>
  );
};

LinearProgress.displayName = 'LinearProgress';

