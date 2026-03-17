import * as React from 'react';

export interface PaginationProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  count: number;
  page: number;
  onChange: (event: React.MouseEvent<HTMLButtonElement>, page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  count,
  page,
  onChange,
  className = '',
  ...props
}) => {
  const pages = Array.from({ length: count }, (_, index) => index + 1);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => {
    if (newPage < 1 || newPage > count || newPage === page) return;
    onChange(event, newPage);
  };

  return (
    <div
      className={`inline-flex items-center gap-1 text-sm ${className}`.trim()}
      {...props}
    >
      <button
        type="button"
        className="px-2 py-1 rounded-radius-small text-text-secondary hover:bg-bg-secondary disabled:opacity-40 disabled:hover:bg-transparent dark:text-text-secondary dark:hover:bg-bg-secondary"
        onClick={(event) => handleClick(event, page - 1)}
        disabled={page === 1}
      >
        ‹
      </button>
      {pages.map((p) => {
        const selected = p === page;
        return (
          <button
            key={p}
            type="button"
            className={`min-w-8 rounded-radius-small px-2 py-1 text-sm ${
              selected
                ? 'bg-accent-primary text-bg-primary'
                : 'text-text-secondary hover:bg-bg-secondary dark:text-text-secondary dark:hover:bg-bg-secondary'
            }`.trim()}
            onClick={(event) => handleClick(event, p)}
          >
            {p}
          </button>
        );
      })}
      <button
        type="button"
        className="px-2 py-1 rounded-radius-small text-text-secondary hover:bg-bg-secondary disabled:opacity-40 disabled:hover:bg-transparent dark:text-text-secondary dark:hover:bg-bg-secondary"
        onClick={(event) => handleClick(event, page + 1)}
        disabled={page === count}
      >
        ›
      </button>
    </div>
  );
};

Pagination.displayName = 'Pagination';

