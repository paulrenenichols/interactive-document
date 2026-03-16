import * as React from 'react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  /** Optional label (rendered after the box) */
  label?: React.ReactNode;
  /** Indeterminate state (e.g. "select all") */
  indeterminate?: boolean;
  className?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      indeterminate = false,
      disabled = false,
      className = '',
      id: idProp,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const inputId = idProp ?? id;
    const internalRef = React.useRef<HTMLInputElement | null>(null);

    const setRef = React.useCallback(
      (el: HTMLInputElement | null) => {
        (internalRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
        if (typeof ref === 'function') {
          ref(el);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
        }
        if (el) {
          el.indeterminate = indeterminate;
        }
      },
      [ref, indeterminate]
    );

    React.useEffect(() => {
      const el = internalRef.current;
      if (el) el.indeterminate = indeterminate;
    }, [indeterminate]);

    const base =
      'h-5 w-5 rounded-radius-extra-small border-2 border-border-default dark:border-border-default ' +
      'bg-bg-primary dark:bg-bg-primary text-accent-primary dark:text-accent-primary ' +
      'focus:ring-2 focus:ring-border-focus focus:ring-offset-0 focus:outline-none ' +
      'disabled:opacity-50 disabled:cursor-not-allowed ' +
      'transition-colors duration-[var(--duration-short)] ' +
      'checked:bg-accent-primary checked:border-accent-primary dark:checked:bg-accent-primary dark:checked:border-accent-primary';

    return (
      <label
        htmlFor={inputId}
        className={`inline-flex cursor-pointer items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`.trim()}
      >
        <input
          ref={setRef}
          type="checkbox"
          id={inputId}
          disabled={disabled}
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

Checkbox.displayName = 'Checkbox';
