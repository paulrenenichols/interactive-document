import * as React from 'react';

export interface ClickAwayListenerProps {
  children: React.ReactNode;
  onClickAway: (event: MouseEvent | TouchEvent) => void;
  /** If true, the click away handler is not invoked. */
  disable?: boolean;
}

export const ClickAwayListener: React.FC<ClickAwayListenerProps> = ({
  children,
  onClickAway,
  disable = false,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (disable) return;
    const handleClick = (event: MouseEvent | TouchEvent) => {
      if (ref.current?.contains(event.target as Node)) return;
      onClickAway(event);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [disable, onClickAway]);

  return <div ref={ref}>{children}</div>;
};

ClickAwayListener.displayName = 'ClickAwayListener';
