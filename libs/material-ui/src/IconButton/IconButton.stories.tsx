import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';

const meta: Meta<typeof IconButton> = {
  component: IconButton,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: {
    children: '★',
    'aria-label': 'Star',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton size="small" aria-label="Small">
        S
      </IconButton>
      <IconButton size="medium" aria-label="Medium">
        M
      </IconButton>
      <IconButton size="large" aria-label="Large">
        L
      </IconButton>
    </div>
  ),
};
