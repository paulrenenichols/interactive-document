import * as React from 'react';

export interface ToggleButtonGroupContextValue {
  value: string | number | (string | number)[] | undefined;
  onChange: (value: string | number) => void;
  exclusive: boolean;
}

export const ToggleButtonGroupContext =
  React.createContext<ToggleButtonGroupContextValue | null>(null);

export interface ToggleButtonGroupProps {
  /** Current value (controlled). Single value if exclusive, array if not. */
  value?: string | number | (string | number)[];
  /** Default value (uncontrolled) */
  defaultValue?: string | number | (string | number)[];
  /** Callback when selection changes */
  onChange?: (value: string | number | (string | number)[]) => void;
  /** If true, only one can be selected (radio-like) */
  exclusive?: boolean;
  /** Horizontal or vertical */
  orientation?: 'horizontal' | 'vertical';
  children: React.ReactNode;
  className?: string;
}

export const ToggleButtonGroup = React.forwardRef<HTMLDivElement, ToggleButtonGroupProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onChange,
      exclusive = true,
      orientation = 'horizontal',
      children,
      className = '',
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<
      string | number | (string | number)[] | undefined
    >(() => valueProp ?? defaultValue ?? (exclusive ? undefined : []));
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : internalValue;

    const handleChange = React.useCallback(
      (v: string | number) => {
        if (exclusive) {
          if (!isControlled) setInternalValue(v);
          onChange?.(v);
        } else {
          const arr = Array.isArray(value) ? [...value] : [];
          const idx = arr.indexOf(v);
          if (idx >= 0) arr.splice(idx, 1);
          else arr.push(v);
          if (!isControlled) setInternalValue(arr);
          onChange?.(arr);
        }
      },
      [exclusive, value, isControlled, onChange]
    );

    const contextValue: ToggleButtonGroupContextValue = React.useMemo(
      () => ({
        value: value ?? (exclusive ? undefined : []),
        onChange: handleChange,
        exclusive,
      }),
      [value, exclusive, handleChange]
    );

    const flexClass =
      orientation === 'vertical' ? 'flex flex-col' : 'inline-flex flex-row';

    return (
      <ToggleButtonGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="group"
          className={`${flexClass} gap-0 ${className}`.trim()}
        >
          {children}
        </div>
      </ToggleButtonGroupContext.Provider>
    );
  }
);

ToggleButtonGroup.displayName = 'ToggleButtonGroup';
