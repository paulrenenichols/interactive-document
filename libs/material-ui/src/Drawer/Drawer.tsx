import * as React from 'react';
import { Portal } from '../Portal';
import { Backdrop } from '../Backdrop';
import { Slide } from '../Transitions';

export type DrawerVariant = 'temporary' | 'persistent';
export type DrawerAnchor = 'left' | 'right';

export interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  variant?: DrawerVariant;
  anchor?: DrawerAnchor;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  variant = 'temporary',
  anchor = 'left',
  className = '',
  children,
  ...props
}) => {
  if (!open && variant === 'persistent') {
    return null;
  }

  const isLeft = anchor === 'left';

  const drawerContent = (
    <Slide in={open} direction={isLeft ? 'right' : 'left'}>
      <div
        className={`fixed inset-y-0 ${
          isLeft ? 'left-0' : 'right-0'
        } z-50 w-72 bg-bg-primary shadow-lg dark:bg-bg-primary ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    </Slide>
  );

  if (variant === 'persistent') {
    return drawerContent;
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-40">
        <Backdrop open={open} onClick={onClose} />
        {drawerContent}
      </div>
    </Portal>
  );
};

Drawer.displayName = 'Drawer';

