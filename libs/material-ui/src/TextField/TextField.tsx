import * as React from 'react';

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      helperText,
      error = false,
      fullWidth = false,
      className = '',
      id: idProp,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const inputId = idProp ?? id;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-text-secondary dark:text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'rounded-radius-medium border bg-bg-primary px-3 py-2 text-text-primary placeholder:text-text-muted',
            'transition-colors duration-[150ms]',
            'focus:outline-none focus:ring-2 focus:ring-border-focus',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-error dark:border-error'
              : 'border-border-default dark:border-border-default',
            fullWidth ? 'w-full' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {helperText && (
          <p
            className={`mt-1 text-xs ${
              error ? 'text-error' : 'text-text-muted dark:text-text-muted'
            }`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
