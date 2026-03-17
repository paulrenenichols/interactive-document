import * as React from 'react';

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  underline?: 'none' | 'hover' | 'always';
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ underline = 'hover', className = '', children, ...props }, ref) => {
    const underlineClass =
      underline === 'none'
        ? 'no-underline'
        : underline === 'always'
          ? 'underline'
          : 'no-underline hover:underline';

    return (
      <a
        ref={ref}
        className={`cursor-pointer text-accent-primary ${underlineClass} transition-colors duration-[150ms] hover:text-accent-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 dark:text-accent-primary dark:hover:text-accent-primary-hover ${className}`.trim()}
        {...props}
      >
        {children}
      </a>
    );
  }
);

Link.displayName = 'Link';

