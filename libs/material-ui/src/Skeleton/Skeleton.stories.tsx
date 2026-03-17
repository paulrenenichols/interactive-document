import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'rectangular', 'circular'],
    },
    animation: {
      control: 'select',
      options: ['pulse', 'none'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const TextRow: Story = {
  render: () => (
    <div className="space-y-2 w-64">
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
    </div>
  ),
};

export const RectangularCard: Story = {
  render: () => (
    <div className="w-64 space-y-3">
      <Skeleton variant="rectangular" height={140} />
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  ),
};

export const CircularAvatar: Story = {
  render: () => (
    <div className="flex items-center space-x-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="space-y-2 w-40">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="70%" />
      </div>
    </div>
  ),
};

