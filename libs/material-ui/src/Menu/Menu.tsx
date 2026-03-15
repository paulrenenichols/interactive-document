import * as React from 'react';

export interface MenuProps {
  open: boolean;
  onClose: () => void;
  anchor: React.ReactNode;
  children: React.ReactNode;
}

export const Menu: React.FC<MenuProps> = ({ open, onClose, anchor, children }) => {
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom, left: rect.left });
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  return (
    <>
      <div ref={anchorRef}>{anchor}</div>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          />
          <div
            className="fixed z-50 min-w-[8rem] rounded-radius-medium border border-border-default bg-bg-primary py-1 shadow-lg dark:border-border-default dark:bg-bg-primary"
            style={{ top: position.top, left: position.left }}
            role="menu"
          >
            {children}
          </div>
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
    className={`block w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-secondary disabled:opacity-50 dark:text-text-primary dark:hover:bg-bg-secondary ${className}`.trim()}
  >
    {children}
  </button>
);

MenuItem.displayName = 'MenuItem';
