import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('frontend', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });

  it('renders with RTL', () => {
    render(<div role="main">Hello</div>);
    expect(screen.getByRole('main')).toHaveTextContent('Hello');
  });
});
