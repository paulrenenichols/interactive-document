import * as React from 'react';
import { useRadioGroup } from './RadioGroup';

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  /** Optional label (rendered after the circle) */
  label?: React.ReactNode;
  className?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, disabled = false, className = '', id: idProp, name, value, onChange, ...props }, ref) => {
    const id = React.useId();
    const inputId = idProp ?? id;
    const group = useRadioGroup();

    const resolvedName = name ?? group?.name;
    const resolvedDisabled = group?.disabled ?? disabled;
    const checked = group ? String(group.value) === String(value) : undefined;
    const resolvedOnChange = onChange ?? group?.onChange;

    const base =
      'h-5 w-5 rounded-radius-full border-2 border-border-default dark:border-border-default ' +
      'bg-bg-primary dark:bg-bg-primary text-accent-primary dark:text-accent-primary ' +
      'focus:ring-2 focus:ring-border-focus focus:ring-offset-0 focus:outline-none ' +
      'disabled:opacity-50 disabled:cursor-not-allowed ' +
      'transition-colors duration-[var(--duration-short)]';

    return (
      <label
        htmlFor={inputId}
        className={`inline-flex cursor-pointer items-center gap-2 ${resolvedDisabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`.trim()}
      >
        <input
          ref={ref}
          type="radio"
          id={inputId}
          name={resolvedName}
          value={value}
          checked={checked}
          disabled={resolvedDisabled}
          onChange={resolvedOnChange}
          className={base}
          {...props}
        />
        {label != null && (
          <span className="text-sm text-text-primary dark:text-text-primary select-none">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
