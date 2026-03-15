import * as React from 'react';
import { Fade, Grow } from '../Transitions';

const FADE_TIMEOUT = { enter: 225, exit: 195 };
const GROW_TIMEOUT = { enter: 225, exit: 195 };

export interface MenuProps {
  open: boolean;
  onClose: () => void;
  anchor: React.ReactNode;
  children: React.ReactNode;
}

export const Menu: React.FC<MenuProps> = ({ open, onClose, anchor, children }) => {
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [exiting, setExiting] = React.useState(false);
  const show = open || exiting;

  React.useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom, left: rect.left });
    }
  }, [open]);

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

  return (
    <>
      <div ref={anchorRef}>{anchor}</div>
      {show && (
        <>
          <Fade in={open} timeout={FADE_TIMEOUT}>
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          aria-hidden
        />
      </Fade>
      <Grow
        in={open}
        timeout={GROW_TIMEOUT}
        onExited={handleExited}
        transformOrigin="top left"
        style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 50 }}
      >
        <div
          className="min-w-[8rem] rounded-radius-medium border border-border-default bg-bg-primary py-1 shadow-lg dark:border-border-default dark:bg-bg-primary"
          role="menu"
        >
          {children}
        </div>
      </Grow>
        </>
      )}
    </>
  );
};

Menu.displayName = 'Menu';

export interface MenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
}) => (
  <button
    type="button"
    role="menuitem"
    disabled={disabled}
    onClick={onClick}
    className={`block w-full px-4 py-2 text-left text-sm text-text-primary transition-colors duration-[150ms] hover:bg-bg-secondary disabled:opacity-50 dark:text-text-primary dark:hover:bg-bg-secondary ${className}`.trim()}
  >
    {children}
  </button>
);

MenuItem.displayName = 'MenuItem';
