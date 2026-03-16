import * as React from 'react';

export type CircularProgressVariant = 'indeterminate' | 'determinate';

export interface CircularProgressProps
  extends React.SVGAttributes<SVGSVGElement> {
  variant?: CircularProgressVariant;
  value?: number;
  size?: number;
  thickness?: number;
}

const CIRCUMFERENCE = 2 * Math.PI * 20;

export const CircularProgress: React.FC<CircularProgressProps> = ({
  variant = 'indeterminate',
  value = 0,
  size = 40,
  thickness = 4,
  className = '',
  ...props
}) => {
  const radius = 20;
  const strokeWidth = thickness;

  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const dashOffset =
    variant === 'determinate'
      ? CIRCUMFERENCE * (1 - normalizedValue / 100)
      : CIRCUMFERENCE * 0.7;

  const circleClasses =
    variant === 'indeterminate'
      ? 'animate-[spin_1.4s_linear_infinite]'
      : '';

  return (
    <svg
      className={`text-accent-primary ${className}`.trim()}
      viewBox="0 0 44 44"
      width={size}
      height={size}
      role="progressbar"
      aria-valuemin={variant === 'determinate' ? 0 : undefined}
      aria-valuemax={variant === 'determinate' ? 100 : undefined}
      aria-valuenow={variant === 'determinate' ? Math.round(normalizedValue) : undefined}
      {...props}
    >
      <circle
        cx="22"
        cy="22"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        className={circleClasses}
      />
    </svg>
  );
};

CircularProgress.displayName = 'CircularProgress';

