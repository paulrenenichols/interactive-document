import * as React from 'react';

export interface CollapseProps {
  in: boolean;
  children: React.ReactElement;
  timeout?: number | { enter?: number; exit?: number };
  onExited?: () => void;
  collapsedSize?: number | string;
  style?: React.CSSProperties;
}

const DEFAULT_TIMEOUT = { enter: 225, exit: 195 };

export const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  (
    {
      in: inProp,
      children,
      timeout = DEFAULT_TIMEOUT,
      onExited,
      collapsedSize = 0,
      style: styleProp,
    },
    ref
  ) => {
    const enterMs =
      typeof timeout === 'number' ? timeout : timeout.enter ?? DEFAULT_TIMEOUT.enter;
    const exitMs =
      typeof timeout === 'number' ? timeout : timeout.exit ?? DEFAULT_TIMEOUT.exit;

    const [exited, setExited] = React.useState(!inProp);
    const wrapperRef = React.useRef<HTMLDivElement | null>(null);

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

    const getHeight = (): number => {
      if (!wrapperRef.current) return 0;
      return wrapperRef.current.scrollHeight;
    };

    const [height, setHeight] = React.useState<number | string>(
      inProp ? 'auto' : collapsedSize
    );

    React.useEffect(() => {
      if (!wrapperRef.current) return;

      let timeoutId: number | undefined;

      if (inProp) {
        const fullHeight = getHeight();
        setHeight(fullHeight);
        timeoutId = window.setTimeout(() => {
          setHeight('auto');
        }, enterMs);
      } else {
        const fullHeight = getHeight();
        setHeight(fullHeight);
        // force reflow before collapsing
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        wrapperRef.current.offsetHeight;
        setHeight(collapsedSize);
      }

      return () => {
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
        }
      };
    }, [inProp, collapsedSize, enterMs, getHeight]);

    if (exited && !inProp) return null;

    const duration = inProp ? enterMs : exitMs;

    const style: React.CSSProperties = {
      height,
      overflow: 'hidden',
      transition: `height ${duration}ms var(--ease-in-out, cubic-bezier(0.4, 0, 0.2, 1))`,
      ...styleProp,
    };

    return (
      <div ref={ref} style={style}>
        <div ref={wrapperRef}>{children}</div>
      </div>
    );
  }
);

Collapse.displayName = 'Collapse';

