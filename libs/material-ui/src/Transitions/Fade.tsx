import * as React from 'react';

export interface FadeProps {
  in: boolean;
  children: React.ReactElement;
  timeout?: number | { enter?: number; exit?: number };
  onExited?: () => void;
  style?: React.CSSProperties;
}

const DEFAULT_TIMEOUT = { enter: 225, exit: 195 };

export const Fade = React.forwardRef<HTMLDivElement, FadeProps>(
  (
    {
      in: inProp,
      children,
      timeout = DEFAULT_TIMEOUT,
      onExited,
      style: styleProp,
    },
    ref
  ) => {
    const enterMs =
      typeof timeout === 'number' ? timeout : timeout.enter ?? DEFAULT_TIMEOUT.enter;
    const exitMs =
      typeof timeout === 'number' ? timeout : timeout.exit ?? DEFAULT_TIMEOUT.exit;

    const [exited, setExited] = React.useState(!inProp);

    React.useEffect(() => {
      if (inProp) {
        setExited(false);
        return undefined;
      }
      const id = window.setTimeout(() => {
        setExited(true);
        onExited?.();
      }, exitMs);
      return () => window.clearTimeout(id);
    }, [inProp, exitMs, onExited]);

    if (exited && !inProp) return null;

    const duration = inProp ? enterMs : exitMs;
    const opacity = inProp ? 1 : 0;

    const style: React.CSSProperties = {
      transition: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      opacity,
      ...styleProp,
    };

    return (
      <div ref={ref} style={style}>
        {children}
      </div>
    );
  }
);

Fade.displayName = 'Fade';
