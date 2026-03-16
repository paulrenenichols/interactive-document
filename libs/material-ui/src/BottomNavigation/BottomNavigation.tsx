import * as React from 'react';

export interface BottomNavigationAction {
  label: React.ReactNode;
  icon?: React.ReactNode;
  value: string;
}

export interface BottomNavigationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  actions: BottomNavigationAction[];
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.MouseEvent<HTMLButtonElement>, value: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  actions,
  value: valueProp,
  defaultValue,
  onChange,
  className = '',
  ...props
}) => {
  const [internalValue, setInternalValue] = React.useState(
    defaultValue ?? actions[0]?.value
  );
  const value = valueProp ?? internalValue;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, newValue: string) => {
    if (valueProp == null) {
      setInternalValue(newValue);
    }
    onChange?.(event, newValue);
  };

  return (
    <div
      className={`flex w-full items-center justify-around border-t border-border-default bg-bg-primary px-2 py-1.5 text-xs text-text-secondary dark:border-border-default dark:bg-bg-primary dark:text-text-secondary ${className}`.trim()}
      {...props}
    >
      {actions.map((action) => {
        const selected = action.value === value;
        return (
          <button
            key={action.value}
            type="button"
            className={`flex flex-1 flex-col items-center justify-center rounded-radius-medium px-2 py-1 transition-colors duration-[150ms] ${
              selected
                ? 'text-accent-primary'
                : 'hover:bg-bg-secondary dark:hover:bg-bg-secondary'
            }`.trim()}
            onClick={(event) => handleClick(event, action.value)}
          >
            {action.icon && (
              <span className="mb-0.5 text-lg" aria-hidden="true">
                {action.icon}
              </span>
            )}
            <span className="truncate">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};

BottomNavigation.displayName = 'BottomNavigation';

