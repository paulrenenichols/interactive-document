import * as React from 'react';
import { Typography } from '../Typography';
import { IconButton } from '../IconButton';

export type AlertSeverity = 'success' | 'info' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  severity?: AlertSeverity;
  title?: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
  children?: React.ReactNode;
}

const severityClasses: Record<AlertSeverity, string> = {
  success:
    'bg-[color:rgb(var(--success)_/_0.08)] text-[color:var(--success)] border-[color:var(--success)]',
  info:
    'bg-[color:rgb(37_99_235_/_0.08)] text-[color:rgb(37_99_235)] border-[color:rgb(37_99_235)]',
  warning:
    'bg-[color:rgb(var(--warning)_/_0.1)] text-[color:var(--warning)] border-[color:var(--warning)]',
  error:
    'bg-[color:rgb(var(--error)_/_0.08)] text-[color:var(--error)] border-[color:var(--error)]',
};

const CloseIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      severity = 'info',
      title,
      action,
      onClose,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={`flex items-start gap-3 rounded-radius-medium border px-4 py-3 ${severityClasses[severity]} ${className}`.trim()}
        {...props}
      >
        <div className="flex-1 space-y-1">
          {title && (
            <Typography
              variant="body1"
              className="font-medium text-current"
            >
              {title}
            </Typography>
          )}
          {children && (
            <Typography
              variant="body2"
              className="text-current"
            >
              {children}
            </Typography>
          )}
        </div>
        {(action || onClose) && (
          <div className="ml-2 flex items-start gap-1">
            {action}
            {onClose && (
              <IconButton
                size="small"
                aria-label="Close"
                onClick={onClose}
                className="text-current"
              >
                <CloseIcon />
              </IconButton>
            )}
          </div>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

