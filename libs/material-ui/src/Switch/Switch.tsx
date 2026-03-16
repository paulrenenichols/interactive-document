import * as React from 'react';

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  /** Optional label (rendered after the track) */
  label?: React.ReactNode;
  className?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, disabled = false, className = '', id: idProp, ...props }, ref) => {
    const id = React.useId();
    const inputId = idProp ?? id;

    return (
      <label
        htmlFor={inputId}
        className={`inline-flex cursor-pointer items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`.trim()}
      >
        <span className="relative inline-block h-6 w-11 shrink-0">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            role="switch"
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <span
            className={
              'block h-6 w-11 rounded-radius-full border-2 border-border-default dark:border-border-default ' +
              'bg-bg-secondary dark:bg-bg-secondary transition-colors duration-[var(--duration-short)] ' +
              'peer-checked:bg-accent-primary peer-checked:border-accent-primary dark:peer-checked:bg-accent-primary dark:peer-checked:border-accent-primary ' +
              'peer-focus:ring-2 peer-focus:ring-border-focus peer-focus:ring-offset-2 peer-focus:outline-none ' +
              'peer-disabled:opacity-50'
            }
          />
          <span
            className={
              'absolute left-0.5 top-0.5 h-5 w-5 rounded-radius-full bg-white dark:bg-bg-primary shadow-sm ' +
              'transition-transform duration-[var(--duration-short)] ease-[var(--ease-out)] ' +
              'peer-checked:translate-x-5'
            }
          />
        </span>
        {label != null && (
          <span className="text-sm text-text-primary dark:text-text-primary select-none">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
