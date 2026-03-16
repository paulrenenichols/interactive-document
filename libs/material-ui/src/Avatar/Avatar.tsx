import * as React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** Image source; if provided, children are ignored */
  src?: string;
  alt?: string;
  /** Size in pixels (default 40) */
  size?: number;
  /** Use theme background for fallback when no image/slots */
  variant?: 'circular' | 'rounded';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      size = 40,
      variant = 'circular',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const rounded =
      variant === 'circular' ? 'rounded-radius-full' : 'rounded-radius-medium';
    const classes = [
      'inline-flex items-center justify-center overflow-hidden bg-bg-secondary dark:bg-bg-secondary text-text-primary dark:text-text-primary flex-shrink-0',
      rounded,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    const style: React.CSSProperties = {
      width: size,
      height: size,
      fontSize: size * 0.5,
    };
    if (src) {
      return (
        <div
          ref={ref}
          className={classes}
          style={{ ...style, ...props.style }}
          {...props}
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }
    return (
      <div ref={ref} className={classes} style={{ ...style, ...props.style }} {...props}>
        {children}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
