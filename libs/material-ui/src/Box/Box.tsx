import * as React from 'react';

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  component?: React.ElementType;
}

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ component = 'div', children, ...props }, ref) => {
    const Component = component;
    return (
      <Component ref={ref} {...props}>
        {children}
      </Component>
    );
  }
);

Box.displayName = 'Box';
