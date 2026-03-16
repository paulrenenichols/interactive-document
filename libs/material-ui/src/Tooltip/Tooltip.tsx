import * as React from 'react';
import { Fade } from '../Transitions';
import { Portal } from '../Portal';

export interface TooltipProps {
  children: React.ReactElement;
  title: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  enterDelay?: number;
  leaveDelay?: number;
}

const DEFAULT_ENTER_DELAY = 0;
const DEFAULT_LEAVE_DELAY = 0;

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  title,
  placement = 'top',
  enterDelay = DEFAULT_ENTER_DELAY,
  leaveDelay = DEFAULT_LEAVE_DELAY,
}) => {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const leaveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = React.useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 8;
    const tooltipHeight = 28;
    const tooltipWidth = 100;
    let top = 0;
    let left = rect.left + rect.width / 2;
    switch (placement) {
      case 'top':
        top = rect.top - tooltipHeight - gap;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - gap;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + gap;
        break;
    }
    setPosition({ top, left });
  }, [placement]);

  const handleEnter = React.useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    enterTimerRef.current = setTimeout(() => {
      updatePosition();
      setOpen(true);
      enterTimerRef.current = null;
    }, enterDelay) as ReturnType<typeof setTimeout>;
  }, [enterDelay, updatePosition]);

  const handleLeave = React.useCallback(() => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    leaveTimerRef.current = setTimeout(() => {
      setOpen(false);
      leaveTimerRef.current = null;
    }, leaveDelay) as ReturnType<typeof setTimeout>;
  }, [leaveDelay]);

  React.useEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  React.useEffect(() => {
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={anchorRef}
        className="inline-flex"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {children}
      </div>
      <Portal>
        <Fade in={open}>
          <div
            role="tooltip"
            className="fixed z-[9999] px-2 py-1.5 text-xs font-medium rounded-radius-extra-small bg-text-primary dark:bg-text-primary text-bg-primary dark:text-bg-primary shadow-md min-w-[max-content] max-w-[200px] whitespace-normal pointer-events-none"
            style={{
              left: position.left,
              top: position.top,
            }}
          >
            {title}
          </div>
        </Fade>
      </Portal>
    </>
  );
};
