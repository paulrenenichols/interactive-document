import * as React from 'react';
import { Fade } from '../Transitions';

const FADE_TIMEOUT = { enter: 225, exit: 195 };

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
}) => {
  const [exiting, setExiting] = React.useState(false);
  const show = open || exiting;

  React.useEffect(() => {
    if (open) setExiting(false);
    else setExiting(true);
  }, [open]);

  const handleExited = React.useCallback(() => setExiting(false), []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
    >
      <Fade in={open} timeout={FADE_TIMEOUT}>
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'var(--overlay)' }}
          onClick={onClose}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          aria-hidden
        />
      </Fade>

      <Fade in={open} timeout={FADE_TIMEOUT} onExited={handleExited}>
        <div
          className="relative w-full max-w-md rounded-radius-extra-large bg-bg-primary shadow-lg dark:bg-bg-primary"
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="border-b border-border-default px-6 py-4 dark:border-border-default">
              <h2
                id="dialog-title"
                className="text-lg font-semibold text-text-primary dark:text-text-primary"
              >
                {title}
              </h2>
            </div>
          )}
          <div className="px-6 py-4 text-text-primary dark:text-text-primary">
            {children}
          </div>
          {actions && (
            <div className="flex justify-end gap-2 border-t border-border-default px-6 py-4 dark:border-border-default">
              {actions}
            </div>
          )}
        </div>
      </Fade>
    </div>
  );
};

Dialog.displayName = 'Dialog';
