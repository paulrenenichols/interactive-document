import * as React from 'react';

export interface NumberFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value' | 'defaultValue' | 'onChange' | 'className'
  > {
  /** Current value (controlled) */
  value?: number;
  /** Default value (uncontrolled) */
  defaultValue?: number;
  /** Min value */
  min?: number;
  /** Max value */
  max?: number;
  /** Step for increment/decrement */
  step?: number;
  /** Label above the field */
  label?: string;
  /** Callback when value changes */
  onChange?: (value: number) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Show increment/decrement buttons */
  showStepper?: boolean;
  className?: string;
}

function clamp(v: number, min?: number, max?: number): number {
  let out = v;
  if (min !== undefined) out = Math.max(min, out);
  if (max !== undefined) out = Math.min(max, out);
  return out;
}

export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      value: valueProp,
      defaultValue,
      min,
      max,
      step = 1,
      label,
      onChange,
      disabled = false,
      fullWidth = false,
      showStepper = true,
      className: classNameProp = '',
      id: idProp,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const inputId = idProp ?? id;
    const [internalValue, setInternalValue] = React.useState<number>(() => {
      const v = valueProp ?? defaultValue ?? (min ?? 0);
      return clamp(Number(v), min, max);
    });
    const isControlled = valueProp !== undefined;
    const value = isControlled ? clamp(valueProp, min, max) : internalValue;

    const update = React.useCallback(
      (next: number) => {
        const clamped = clamp(next, min, max);
        if (!isControlled) setInternalValue(clamped);
        onChange?.(clamped);
      },
      [isControlled, onChange, min, max]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '' || raw === '-') {
        if (!isControlled) setInternalValue(min ?? 0);
        return;
      }
      const num = Number(raw);
      if (!Number.isNaN(num)) update(num);
    };

    const handleStep = (delta: number) => {
      update(value + delta);
    };

    const inputClass =
      'rounded-radius-medium border border-border-default dark:border-border-default bg-bg-primary px-3 py-2 text-text-primary ' +
      'focus:outline-none focus:ring-2 focus:ring-border-focus disabled:opacity-50 disabled:cursor-not-allowed ' +
      'transition-colors duration-[150ms]';

    const stepperClass =
      'flex shrink-0 flex-col border-border-default dark:border-border-default border-l ' +
      'rounded-r-radius-medium [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:h-1/2 [&_button]:px-2 [&_button]:text-text-muted [&_button]:hover:bg-bg-secondary [&_button]:disabled:opacity-50';

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${classNameProp}`.trim()}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-text-secondary dark:text-text-secondary"
          >
            {label}
          </label>
        )}
        <div className={`inline-flex ${fullWidth ? 'w-full' : ''}`.trim()}>
          <input
            ref={ref}
            id={inputId}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={handleInputChange}
            className={`${inputClass} ${showStepper ? 'rounded-r-none border-r-0' : ''} ${fullWidth ? 'w-full min-w-0' : ''}`}
            {...props}
          />
          {showStepper && (
            <div className={stepperClass}>
              <button
                type="button"
                tabIndex={-1}
                disabled={disabled || (max !== undefined && value >= max)}
                onClick={() => handleStep(step)}
                aria-label="Increment"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14l5-5 5 5z" />
                </svg>
              </button>
              <button
                type="button"
                tabIndex={-1}
                disabled={disabled || (min !== undefined && value <= min)}
                onClick={() => handleStep(-step)}
                aria-label="Decrement"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

NumberField.displayName = 'NumberField';
