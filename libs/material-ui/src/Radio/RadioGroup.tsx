import * as React from 'react';

export interface RadioGroupContextValue {
  name: string;
  value: string | number | undefined;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
  /** Name for the underlying radio inputs (required for grouping) */
  name: string;
  /** Current value (controlled) */
  value?: string | number;
  /** Initial value (uncontrolled) */
  defaultValue?: string | number;
  /** Callback when selection changes */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Disable all radios in the group */
  disabled?: boolean;
  /** Layout: row or column */
  row?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      value: valueProp,
      defaultValue,
      onChange,
      disabled = false,
      row = false,
      children,
      className = '',
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<string | number | undefined>(
      valueProp ?? defaultValue
    );
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : internalValue;

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) {
          setInternalValue(event.target.value);
        }
        onChange?.(event);
      },
      [isControlled, onChange]
    );

    React.useEffect(() => {
      if (isControlled) {
        setInternalValue(valueProp);
      }
    }, [isControlled, valueProp]);

    const contextValue: RadioGroupContextValue = React.useMemo(
      () => ({ name, value, onChange: handleChange, disabled }),
      [name, value, handleChange, disabled]
    );

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="radiogroup"
          className={`flex gap-4 ${row ? 'flex-row' : 'flex-col'} ${className}`.trim()}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export function useRadioGroup(): RadioGroupContextValue | null {
  return React.useContext(RadioGroupContext);
}
