import * as React from 'react';
import { ToggleButtonGroupContext } from './ToggleButtonGroup';

export interface ToggleButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  /** Selected (on) state when used standalone */
  selected?: boolean;
  /** When used inside ToggleButtonGroup, value for this option */
  value?: string | number;
  children: React.ReactNode;
  className?: string;
}

function isSelected(
  group: { value: string | number | (string | number)[] | undefined; exclusive: boolean } | null,
  value: string | number | undefined,
  selectedProp: boolean
): boolean {
  if (value === undefined) return selectedProp;
  if (!group) return selectedProp;
  const v = group.value;
  if (v === undefined) return false;
  if (group.exclusive) return v === value;
  return Array.isArray(v) && v.includes(value);
}

export const ToggleButton = React.forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    {
      selected: selectedProp = false,
      value,
      disabled = false,
      children,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const group = React.useContext(ToggleButtonGroupContext);
    const selected = isSelected(group, value, selectedProp);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (group && value !== undefined) group.onChange(value);
      onClick?.(e);
    };

    const base =
      'inline-flex items-center justify-center gap-2 rounded-radius-medium px-4 py-2 text-sm font-medium ' +
      'border-2 transition-colors duration-[150ms] focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 ' +
      'disabled:opacity-50 disabled:pointer-events-none';
    const selectedClass =
      selected
        ? 'border-accent-primary bg-accent-primary/10 text-accent-primary dark:border-accent-primary dark:bg-accent-primary/20 dark:text-accent-primary'
        : 'border-border-default bg-bg-primary text-text-primary dark:border-border-default dark:bg-bg-primary dark:text-text-primary hover:bg-bg-secondary dark:hover:bg-bg-secondary';

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={selected}
        disabled={disabled}
        data-value={value}
        className={`${base} ${selectedClass} ${className}`.trim()}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ToggleButton.displayName = 'ToggleButton';
