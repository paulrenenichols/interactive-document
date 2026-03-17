import * as React from 'react';

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  /** Size in pixels (default 24); applied as width/height to inner SVG */
  size?: number;
  /** Optional color class (default: currentColor) */
  color?: 'inherit' | 'primary' | 'secondary' | 'muted';
}

const colorMap = {
  inherit: 'text-inherit',
  primary: 'text-accent-primary dark:text-accent-primary',
  secondary: 'text-text-secondary dark:text-text-secondary',
  muted: 'text-text-muted dark:text-text-muted',
};

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  (
    {
      size = 24,
      color = 'inherit',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const colorClass = colorMap[color];
    const classes = [
      'inline-flex items-center justify-center flex-shrink-0 [&_svg]:w-full [&_svg]:h-full',
      colorClass,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <span
        ref={ref}
        className={classes}
        style={{ width: size, height: size }}
        role="img"
        {...props}
      >
        {children}
      </span>
    );
  }
);

Icon.displayName = 'Icon';
