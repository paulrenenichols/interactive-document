import * as React from 'react';
import { Portal } from '../Portal';
import { Fade } from '../Transitions';

const FADE_TIMEOUT = { enter: 225, exit: 195 };

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional container for the portal. Defaults to document.body */
  container?: HTMLElement | null;
}

const focusableSelector =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  container,
}) => {
  const [exiting, setExiting] = React.useState(false);
  const show = open || exiting;
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) setExiting(false);
    else setExiting(true);
  }, [open]);

  const handleExited = React.useCallback(() => setExiting(false), []);

  if (!show) return null;

  // Scroll lock
  React.useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  // Escape to close
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Focus trap: keep focus inside modal when open
  React.useEffect(() => {
    if (!open || !contentRef.current) return;
    const el = contentRef.current;
    const focusables = getFocusableElements(el);
    if (focusables.length > 0) {
      focusables[0].focus();
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusables = getFocusableElements(el);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <Portal container={container}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="presentation"
      >
        <Fade in={open} timeout={FADE_TIMEOUT}>
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'var(--overlay)' }}
            onClick={onClose}
            aria-hidden
          />
        </Fade>
        <Fade in={open} timeout={FADE_TIMEOUT} onExited={handleExited}>
          <div ref={contentRef} onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </Fade>
      </div>
    </Portal>
  );
};

Modal.displayName = 'Modal';
