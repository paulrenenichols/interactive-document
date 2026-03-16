import * as React from 'react';

export interface NavigationRailAction {
  label: React.ReactNode;
  icon?: React.ReactNode;
  value: string;
}

export interface NavigationRailProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  actions: NavigationRailAction[];
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.MouseEvent<HTMLButtonElement>, value: string) => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
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
      className={`flex h-full w-16 flex-col items-center gap-1 border-r border-border-default bg-bg-primary py-2 text-xs text-text-secondary dark:border-border-default dark:bg-bg-primary dark:text-text-secondary ${className}`.trim()}
      {...props}
    >
      {actions.map((action) => {
        const selected = action.value === value;
        return (
          <button
            key={action.value}
            type="button"
            className={`flex h-14 w-12 flex-col items-center justify-center rounded-radius-large transition-colors duration-[150ms] ${
              selected
                ? 'bg-accent-primary text-bg-primary'
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

NavigationRail.displayName = 'NavigationRail';

