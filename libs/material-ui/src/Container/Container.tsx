import * as React from 'react';

export type ContainerMaxWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** Max width breakpoint; uses theme-aligned pixel values */
  maxWidth?: ContainerMaxWidth;
  /** Disable horizontal padding */
  disableGutters?: boolean;
}

const maxWidthMap: Record<ContainerMaxWidth, string> = {
  xs: 'max-w-[444px]',
  sm: 'max-w-[600px]',
  md: 'max-w-[840px]',
  lg: 'max-w-[1200px]',
  xl: 'max-w-[1536px]',
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      maxWidth = 'lg',
      disableGutters = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const classes = [
      'mx-auto w-full box-border',
      maxWidthMap[maxWidth],
      disableGutters ? '' : 'px-4 sm:px-6 md:px-8',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
