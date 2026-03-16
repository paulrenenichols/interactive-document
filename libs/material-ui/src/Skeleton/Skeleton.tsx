import * as React from 'react';

export type SkeletonVariant = 'text' | 'rectangular' | 'circular';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'none';
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      animation = 'pulse',
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const borderRadius =
      variant === 'circular'
        ? 'rounded-radius-full'
        : variant === 'rectangular'
          ? 'rounded-radius-medium'
          : 'rounded-radius-extra-small';

    const baseHeight =
      variant === 'text'
        ? 'h-4'
        : 'h-6';

    const animationClass = animation === 'pulse' ? 'animate-pulse' : '';

    const resolvedStyle: React.CSSProperties = {
      width,
      height,
      ...style,
    };

    return (
      <div
        ref={ref}
        className={`${borderRadius} ${baseHeight} bg-bg-secondary dark:bg-bg-secondary ${animationClass} ${className}`.trim()}
        style={resolvedStyle}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

