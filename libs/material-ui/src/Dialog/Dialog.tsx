import * as React from 'react';

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
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/60"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      />

      {/* Panel */}
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
    </div>
  );
};

Dialog.displayName = 'Dialog';
