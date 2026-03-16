import * as React from 'react';

export type SlideDirection = 'left' | 'right' | 'up' | 'down';

export interface SlideProps {
  in: boolean;
  children: React.ReactElement;
  direction?: SlideDirection;
  timeout?: number | { enter?: number; exit?: number };
  onExited?: () => void;
  style?: React.CSSProperties;
}

const DEFAULT_TIMEOUT = { enter: 225, exit: 195 };

function getTranslate(
  direction: SlideDirection,
  inProp: boolean
): string {
  const offset = inProp ? '0%' : '100%';
  switch (direction) {
    case 'left':
      return `translateX(${inProp ? '0%' : '100%'})`;
    case 'right':
      return `translateX(${inProp ? '0%' : '-100%'})`;
    case 'up':
      return `translateY(${inProp ? '0%' : '100%'})`;
    case 'down':
      return `translateY(${inProp ? '0%' : '-100%'})`;
    default:
      return `translateX(${offset})`;
  }
}

export const Slide = React.forwardRef<HTMLDivElement, SlideProps>(
  (
    {
      in: inProp,
      children,
      direction = 'up',
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
    const transform = getTranslate(direction, inProp);

    const style: React.CSSProperties = {
      transition: `transform ${duration}ms var(--ease-in-out, cubic-bezier(0.4, 0, 0.2, 1))`,
      transform,
      ...styleProp,
    };

    return (
      <div ref={ref} style={style}>
        {children}
      </div>
    );
  }
);

Slide.displayName = 'Slide';

