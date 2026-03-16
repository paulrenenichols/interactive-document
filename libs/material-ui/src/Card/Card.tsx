import * as React from 'react';
import { Paper } from '../Paper';
import { Typography } from '../Typography';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'filled' | 'outlined';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'elevated', className = '', children, ...props }, ref) => {
    return (
      <Paper
        ref={ref}
        variant={variant}
        className={`overflow-hidden ${className}`.trim()}
        {...props}
      >
        {children}
      </Paper>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  avatar?: React.ReactNode;
  title?: React.ReactNode;
  subheader?: React.ReactNode;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  avatar,
  title,
  subheader,
  action,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 ${className}`.trim()}
      {...props}
    >
      {avatar && <div className="mt-1">{avatar}</div>}
      <div className="min-w-0 flex-1">
        {title && (
          <Typography
            variant="body1"
            className="truncate text-text-primary dark:text-text-primary"
          >
            {title}
          </Typography>
        )}
        {subheader && (
          <Typography
            variant="body2"
            className="text-text-secondary dark:text-text-secondary"
          >
            {subheader}
          </Typography>
        )}
      </div>
      {action && <div className="ml-2">{action}</div>}
    </div>
  );
};

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent: React.FC<CardContentProps> = ({
  className = '',
  ...props
}) => (
  <div
    className={`px-4 py-3 text-text-primary dark:text-text-primary ${className}`.trim()}
    {...props}
  />
);

export interface CardActionsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  disableSpacing?: boolean;
}

export const CardActions: React.FC<CardActionsProps> = ({
  disableSpacing = false,
  className = '',
  children,
  ...props
}) => (
  <div
    className={`flex items-center ${
      disableSpacing ? '' : 'gap-2 px-4 py-2'
    } ${className}`.trim()}
    {...props}
  >
    {children}
  </div>
);

export interface CardMediaProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  component?: 'img' | 'div';
}

export const CardMedia: React.FC<CardMediaProps> = ({
  component = 'img',
  className = '',
  ...props
}) => {
  if (component === 'div') {
    return (
      <div
        className={`h-40 w-full bg-bg-secondary dark:bg-bg-secondary ${className}`.trim()}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      />
    );
  }

  return (
    <img
      className={`h-40 w-full object-cover ${className}`.trim()}
      {...props}
    />
  );
};

