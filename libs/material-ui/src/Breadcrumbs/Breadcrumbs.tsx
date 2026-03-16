import * as React from 'react';
import { Link } from '../Link';

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
}

export interface BreadcrumbsProps
  extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = '/',
  className = '',
  ...props
}) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={className}
      {...props}
    >
      <ol className="flex flex-wrap items-center gap-1 text-sm text-text-secondary dark:text-text-secondary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const content = item.href || item.onClick ? (
            <Link
              href={item.href}
              onClick={item.onClick}
              underline="hover"
              className={isLast ? 'font-medium text-text-primary dark:text-text-primary' : ''}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={isLast ? 'font-medium text-text-primary dark:text-text-primary' : ''}
            >
              {item.label}
            </span>
          );

          return (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <span className="mx-1 text-text-muted dark:text-text-muted">
                  {separator}
                </span>
              )}
              {content}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumbs.displayName = 'Breadcrumbs';

