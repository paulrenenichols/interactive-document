import * as React from 'react';
import { Collapse } from '../Transitions';

export interface AccordionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
  disabled?: boolean;
  summary: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({
  expanded: expandedProp,
  defaultExpanded = false,
  onChange,
  disabled = false,
  summary,
  children,
  className = '',
  ...props
}) => {
  const [expandedState, setExpandedState] = React.useState(defaultExpanded);
  const expanded = expandedProp ?? expandedState;

  const handleToggle = (event: React.SyntheticEvent) => {
    if (disabled) return;
    const next = !expanded;
    if (expandedProp == null) {
      setExpandedState(next);
    }
    onChange?.(event, next);
  };

  const contentId = React.useId();
  const headerId = React.useId();

  return (
    <div
      className={`rounded-radius-medium border border-border-default bg-bg-primary dark:border-border-default dark:bg-bg-primary ${className}`.trim()}
      {...props}
    >
      <button
        type="button"
        id={headerId}
        aria-controls={contentId}
        aria-expanded={expanded}
        disabled={disabled}
        onClick={handleToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-text-primary transition-colors duration-[150ms] hover:bg-bg-secondary disabled:opacity-50 dark:text-text-primary dark:hover:bg-bg-secondary"
      >
        <span>{summary}</span>
        <span
          className={`ml-2 inline-flex transform text-text-secondary transition-transform duration-[150ms] dark:text-text-secondary ${
            expanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>
      <Collapse in={expanded}>
        <div
          id={contentId}
          role="region"
          aria-labelledby={headerId}
          className="px-4 py-3 text-sm text-text-primary dark:text-text-primary"
        >
          {children}
        </div>
      </Collapse>
    </div>
  );
};

Accordion.displayName = 'Accordion';

