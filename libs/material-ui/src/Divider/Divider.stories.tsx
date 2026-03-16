import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';
import { Stack } from '../Stack';
import { Typography } from '../Typography';

const meta: Meta<typeof Divider> = {
  component: Divider,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  args: {},
};

export const InStack: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="body1">Above</Typography>
      <Divider />
      <Typography variant="body1">Below</Typography>
    </Stack>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex items-center gap-4 h-12">
      <span className="text-text-primary dark:text-text-primary">One</span>
      <Divider orientation="vertical" flexItem />
      <span className="text-text-primary dark:text-text-primary">Two</span>
      <Divider orientation="vertical" flexItem />
      <span className="text-text-primary dark:text-text-primary">Three</span>
    </div>
  ),
};
