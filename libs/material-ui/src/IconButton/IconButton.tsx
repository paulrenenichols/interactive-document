import * as React from 'react';

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

const sizeClasses = {
  small: 'p-1.5 rounded-radius-extra-small',
  medium: 'p-2 rounded-radius-small',
  large: 'p-2.5 rounded-radius-medium',
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      size = 'medium',
      disabled = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center text-text-primary transition-colors duration-[150ms] hover:bg-bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:text-text-primary dark:hover:bg-bg-secondary ${sizeClasses[size]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
);

IconButton.displayName = 'IconButton';
