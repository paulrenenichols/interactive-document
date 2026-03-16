import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  component: Pagination,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  render: () => {
    const [page, setPage] = React.useState(2);
    return (
      <Pagination
        count={5}
        page={page}
        onChange={(_, newPage) => setPage(newPage)}
      />
    );
  },
};

