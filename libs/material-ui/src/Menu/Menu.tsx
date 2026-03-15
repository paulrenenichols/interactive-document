import * as React from 'react';
import { Popover } from '../Popover';

export interface MenuProps {
  open: boolean;
  onClose: () => void;
  anchor: React.ReactNode;
  children: React.ReactNode;
}

export const Menu: React.FC<MenuProps> = ({ open, onClose, anchor, children }) => {
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open && anchorRef.current) setAnchorEl(anchorRef.current);
    else if (!open) setAnchorEl(null);
  }, [open]);

  return (
    <>
      <div ref={anchorRef}>{anchor}</div>
      <Popover
        open={open}
        onClose={onClose}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin="top left"
      >
        <div
          className="min-w-[8rem] rounded-radius-medium border border-border-default bg-bg-primary py-1 shadow-lg dark:border-border-default dark:bg-bg-primary"
          role="menu"
        >
          {children}
        </div>
      </Popover>
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
