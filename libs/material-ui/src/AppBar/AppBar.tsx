import * as React from 'react';

export type AppBarPosition = 'fixed' | 'absolute' | 'sticky' | 'static';
export type AppBarVariant = 'center-aligned' | 'small' | 'medium' | 'large';

export interface AppBarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  position?: AppBarPosition;
  variant?: AppBarVariant;
  leading?: React.ReactNode;
  title?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const AppBar: React.FC<AppBarProps> = ({
  position = 'fixed',
  variant = 'medium',
  leading,
  title,
  trailing,
  className = '',
  children,
  ...props
}) => {
  const positionClass =
    position === 'fixed'
      ? 'fixed top-0 inset-x-0'
      : position === 'absolute'
        ? 'absolute top-0 inset-x-0'
        : position === 'sticky'
          ? 'sticky top-0'
          : '';

  const heightClass =
    variant === 'small'
      ? 'h-12'
      : variant === 'large'
        ? 'h-20'
        : 'h-16';

  const content = (
    <header
      className={`z-40 flex items-center gap-3 border-b border-border-default bg-bg-primary/90 px-4 text-text-primary shadow-sm backdrop-blur dark:border-border-default dark:bg-bg-primary/90 dark:text-text-primary ${heightClass} ${className}`.trim()}
      {...props}
    >
      {leading && <div className="flex items-center">{leading}</div>}
      {title && (
        <div className="flex-1 text-sm font-medium truncate text-center sm:text-left">
          {title}
        </div>
      )}
      {trailing && (
        <div className="flex items-center justify-end gap-2">{trailing}</div>
      )}
      {children}
    </header>
  );

  if (positionClass) {
    return <div className={positionClass}>{content}</div>;
  }

  return content;
};

AppBar.displayName = 'AppBar';

