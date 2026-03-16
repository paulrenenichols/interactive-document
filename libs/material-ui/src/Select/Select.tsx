import * as React from 'react';
import { Popover } from '../Popover';

export interface SelectOption<T = string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps<T = string> {
  /** Current value (controlled) */
  value?: T;
  /** Default value (uncontrolled) */
  defaultValue?: T;
  /** Options to display */
  options: SelectOption<T>[];
  /** Placeholder when nothing selected */
  placeholder?: string;
  /** Label above the field */
  label?: string;
  /** Callback when selection changes */
  onChange?: (value: T) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Render the selected option (default: option.label) */
  renderValue?: (value: T, option: SelectOption<T> | undefined) => React.ReactNode;
  className?: string;
  id?: string;
}

export function Select<T = string>({
  value: valueProp,
  defaultValue,
  options,
  placeholder = 'Select…',
  label,
  onChange,
  disabled = false,
  fullWidth = false,
  renderValue,
  className = '',
  id: idProp,
}: SelectProps<T>) {
  const id = React.useId();
  const inputId = idProp ?? id;
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<T | undefined>(defaultValue);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open && anchorRef.current) setAnchorEl(anchorRef.current);
    else if (!open) setAnchorEl(null);
  }, [open]);

  const selectedOption = options.find((o) => o.value === value);
  const display =
    renderValue && value !== undefined
      ? renderValue(value, selectedOption)
      : selectedOption?.label ?? placeholder;

  const handleSelect = (option: SelectOption<T>) => {
    if (option.disabled) return;
    if (!isControlled) setInternalValue(option.value);
    onChange?.(option.value);
    setOpen(false);
  };

  const triggerClass =
    'flex items-center justify-between gap-2 rounded-radius-medium border bg-bg-primary px-3 py-2 text-left text-sm text-text-primary ' +
    'transition-colors duration-[150ms] focus:outline-none focus:ring-2 focus:ring-border-focus ' +
    'disabled:opacity-50 disabled:cursor-not-allowed ' +
    (value !== undefined && selectedOption
      ? 'border-border-default dark:border-border-default'
      : 'border-border-default dark:border-border-default text-text-muted dark:text-text-muted');

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
      <button
        ref={anchorRef}
        id={inputId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label ?? placeholder}
        className={`${triggerClass} ${fullWidth ? 'w-full' : ''} ${className}`.trim()}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span className="min-w-0 truncate">{display}</span>
        <svg
          className={`ml-1 h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin="top left"
      >
        <ul
          role="listbox"
          className="min-w-[var(--anchor-width, 12rem)] max-h-60 overflow-auto rounded-radius-medium border border-border-default bg-bg-primary py-1 shadow-lg dark:border-border-default dark:bg-bg-primary"
          style={
            anchorEl
              ? { minWidth: anchorEl.getBoundingClientRect().width }
              : undefined
          }
        >
          {options.map((option) => (
            <li
              key={String(option.value)}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleSelect(option)}
              className={`block w-full cursor-pointer px-4 py-2 text-left text-sm text-text-primary transition-colors hover:bg-bg-secondary dark:text-text-primary dark:hover:bg-bg-secondary ${
                option.value === value ? 'bg-bg-secondary dark:bg-bg-secondary' : ''
              } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </Popover>
    </div>
  );
}

Select.displayName = 'Select';
