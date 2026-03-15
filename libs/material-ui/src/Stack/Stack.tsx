import * as React from 'react';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  direction?: 'row' | 'column';
  spacing?: number;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around';
}

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = 'column',
      spacing = 1,
      alignItems,
      justifyContent,
      className = '',
      children,
      style,
      ...props
    },
    ref
  ) => {
    const gap = spacing * 8; // 8px base unit
    const flexDir = direction === 'row' ? 'flex-row' : 'flex-col';
    const classes = [
      'flex',
      flexDir,
      alignItems != null && alignMap[alignItems],
      justifyContent != null && justifyMap[justifyContent],
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div
        ref={ref}
        className={classes}
        style={{ gap: `${gap}px`, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Stack.displayName = 'Stack';
