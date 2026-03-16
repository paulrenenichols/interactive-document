import * as React from 'react';
import { Fade } from '../Transitions';

export interface BackdropProps
  extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  invisible?: boolean;
}

const FADE_TIMEOUT = { enter: 225, exit: 195 };

export const Backdrop: React.FC<BackdropProps> = ({
  open,
  invisible = false,
  className = '',
  style,
  ...props
}) => {
  if (!open) return null;

  const backgroundStyle: React.CSSProperties = invisible
    ? { backgroundColor: 'transparent' }
    : { backgroundColor: 'var(--overlay)' };

  return (
    <Fade in={open} timeout={FADE_TIMEOUT}>
      <div
        className={`fixed inset-0 z-40 ${className}`.trim()}
        style={{ ...backgroundStyle, ...style }}
        aria-hidden="true"
        {...props}
      />
    </Fade>
  );
};

Backdrop.displayName = 'Backdrop';

