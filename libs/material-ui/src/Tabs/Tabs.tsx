import * as React from 'react';

export interface Tab {
  label: React.ReactNode;
  value: string;
}

export interface TabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: Tab[];
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.MouseEvent<HTMLButtonElement>, value: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  value: valueProp,
  defaultValue,
  onChange,
  className = '',
  ...props
}) => {
  const [internalValue, setInternalValue] = React.useState(
    defaultValue ?? tabs[0]?.value
  );
  const value = valueProp ?? internalValue;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, newValue: string) => {
    if (valueProp == null) {
      setInternalValue(newValue);
    }
    onChange?.(event, newValue);
  };

  return (
    <div className={className} {...props}>
      <div className="inline-flex rounded-radius-medium bg-bg-secondary p-1 dark:bg-bg-secondary">
        {tabs.map((tab) => {
          const selected = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              className={`relative rounded-radius-small px-3 py-1.5 text-sm transition-colors duration-[150ms] ${
                selected
                  ? 'bg-bg-primary text-text-primary shadow-sm dark:bg-bg-primary dark:text-text-primary'
                  : 'text-text-secondary hover:text-text-primary dark:text-text-secondary dark:hover:text-text-primary'
              }`.trim()}
              aria-selected={selected}
              role="tab"
              onClick={(event) => handleClick(event, tab.value)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

Tabs.displayName = 'Tabs';

