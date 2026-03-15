import * as React from 'react';
import { Modal } from '../Modal';

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
}) => (
  <Modal open={open} onClose={onClose}>
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
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
  </Modal>
);

Dialog.displayName = 'Dialog';
