import * as React from 'react';

export interface Step {
  label: React.ReactNode;
  description?: React.ReactNode;
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: Step[];
  activeStep?: number;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep = 0,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex flex-col gap-4 ${className}`.trim()}
      {...props}
    >
      {steps.map((step, index) => {
        const completed = index < activeStep;
        const current = index === activeStep;
        return (
          <div key={index} className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-radius-full border text-xs font-medium ${
                completed
                  ? 'border-accent-primary bg-accent-primary text-bg-primary'
                  : current
                    ? 'border-accent-primary text-accent-primary'
                    : 'border-border-default text-text-muted'
              }`.trim()}
            >
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-text-primary dark:text-text-primary">
                {step.label}
              </div>
              {step.description && (
                <div className="text-xs text-text-secondary dark:text-text-secondary">
                  {step.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

Stepper.displayName = 'Stepper';

