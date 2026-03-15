import * as React from 'react';
import { createPortal } from 'react-dom';
import { Fade, Grow } from '../Transitions';

const FADE_TIMEOUT = { enter: 225, exit: 195 };
const GROW_TIMEOUT = { enter: 225, exit: 195 };

export interface PopoverProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  children: React.ReactNode;
  /** Where to anchor the popover relative to the anchor element. Default: bottom-left */
  anchorOrigin?: { vertical: 'top' | 'bottom'; horizontal: 'left' | 'center' | 'right' };
  /** Transform origin for the Grow animation. Default: top left */
  transformOrigin?: string;
  container?: HTMLElement | null;
}

export const Popover: React.FC<PopoverProps> = ({
  open,
  onClose,
  anchorEl,
  children,
  anchorOrigin = { vertical: 'bottom', horizontal: 'left' },
  transformOrigin = 'top left',
  container = typeof document !== 'undefined' ? document.body : null,
}) => {
  const [exiting, setExiting] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const show = open || exiting;

  React.useEffect(() => {
    if (open && anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const v = anchorOrigin.vertical === 'bottom' ? rect.bottom : rect.top;
      let h: number;
      if (anchorOrigin.horizontal === 'left') h = rect.left;
      else if (anchorOrigin.horizontal === 'right') h = rect.right;
      else h = rect.left + rect.width / 2;
      setPosition({ top: v, left: h });
    }
  }, [open, anchorEl, anchorOrigin.vertical, anchorOrigin.horizontal]);

  React.useEffect(() => {
    if (open) setExiting(false);
    else setExiting(true);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  const handleExited = React.useCallback(() => setExiting(false), []);

  if (!show || container == null) return null;

  const content = (
    <>
      <Fade in={open} timeout={FADE_TIMEOUT}>
        <div
          className="fixed inset-0"
          style={{ zIndex: 49 }}
          onClick={onClose}
          aria-hidden
        />
      </Fade>
      <Grow
        in={open}
        timeout={GROW_TIMEOUT}
        onExited={handleExited}
        transformOrigin={transformOrigin}
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 50,
        }}
      >
        <div>{children}</div>
      </Grow>
    </>
  );

  return createPortal(content, container);
};

Popover.displayName = 'Popover';
