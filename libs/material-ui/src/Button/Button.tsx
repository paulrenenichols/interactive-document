import * as React from 'react';

export type ButtonVariant = 'filled' | 'outlined' | 'text';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  disabled?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  filled:
    'bg-accent-primary text-white border border-transparent shadow-sm hover:bg-accent-primary-hover active:bg-accent-primary-active disabled:opacity-50 disabled:pointer-events-none dark:bg-accent-primary dark:hover:bg-accent-primary-hover dark:active:bg-accent-primary-active',
  outlined:
    'bg-transparent border-2 border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-white dark:border-accent-primary dark:text-accent-primary dark:hover:bg-accent-primary dark:hover:text-white disabled:opacity-50 disabled:pointer-events-none',
  text: 'bg-transparent text-accent-primary hover:bg-accent-primary/10 dark:text-accent-primary dark:hover:bg-accent-primary/20 disabled:opacity-50 disabled:pointer-events-none',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'filled',
      disabled = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-radius-medium px-4 py-2 text-sm font-medium transition-opacity transition-colors duration-[150ms] focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2';
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={`${base} ${variantClasses[variant]} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
