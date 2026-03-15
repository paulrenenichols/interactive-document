import * as React from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children: React.ReactNode;
  container?: HTMLElement | null;
}

export const Portal: React.FC<PortalProps> = ({
  children,
  container = typeof document !== 'undefined' ? document.body : null,
}) => {
  if (container == null) return null;
  return createPortal(children, container);
};

Portal.displayName = 'Portal';
