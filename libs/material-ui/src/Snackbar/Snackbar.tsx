import * as React from 'react';
import { Portal } from '../Portal';
import { Fade } from '../Transitions';

export type SnackbarVertical = 'top' | 'bottom';
export type SnackbarHorizontal = 'left' | 'center' | 'right';

export interface SnackbarAnchorOrigin {
  vertical: SnackbarVertical;
  horizontal: SnackbarHorizontal;
}

export interface SnackbarProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  message: React.ReactNode;
  action?: React.ReactNode;
  autoHideDuration?: number;
  onClose: () => void;
  anchorOrigin?: SnackbarAnchorOrigin;
}

const DEFAULT_ORIGIN: SnackbarAnchorOrigin = {
  vertical: 'bottom',
  horizontal: 'center',
};

const FADE_TIMEOUT = { enter: 225, exit: 195 };

export const Snackbar: React.FC<SnackbarProps> = ({
  open,
  message,
  action,
  autoHideDuration = 4000,
  onClose,
  anchorOrigin = DEFAULT_ORIGIN,
  className = '',
  style,
  ...props
}) => {
  const [visible, setVisible] = React.useState(open);

  React.useEffect(() => {
    setVisible(open);
  }, [open]);

  React.useEffect(() => {
    if (!open || autoHideDuration == null) return;
    const id = window.setTimeout(onClose, autoHideDuration);
    return () => window.clearTimeout(id);
  }, [open, autoHideDuration, onClose]);

  if (!visible && !open) return null;

  const verticalClass =
    anchorOrigin.vertical === 'top' ? 'top-4' : 'bottom-4';
  const horizontalClass =
    anchorOrigin.horizontal === 'left'
      ? 'left-4'
      : anchorOrigin.horizontal === 'right'
        ? 'right-4'
        : 'left-1/2 -translate-x-1/2';

  return (
    <Portal>
      <div className="fixed inset-x-0 z-[9999] pointer-events-none">
        <Fade in={open} timeout={FADE_TIMEOUT}>
          <div
            className={`absolute ${verticalClass} ${horizontalClass} pointer-events-auto`.trim()}
          >
            <div
              className={`flex items-center gap-3 rounded-radius-medium bg-text-primary px-4 py-3 text-sm text-bg-primary shadow-lg dark:bg-text-primary dark:text-bg-primary ${className}`.trim()}
              role="status"
              style={style}
              {...props}
            >
              <div className="flex-1">{message}</div>
              {action && <div className="ml-2">{action}</div>}
            </div>
          </div>
        </Fade>
      </div>
    </Portal>
  );
};

Snackbar.displayName = 'Snackbar';

