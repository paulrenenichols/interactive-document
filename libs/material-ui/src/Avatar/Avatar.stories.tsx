import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';
import { Stack } from '../Stack';

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const WithInitials: Story = {
  args: {
    children: 'JD',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    alt: 'Avatar',
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar size={24}>S</Avatar>
      <Avatar size={40}>M</Avatar>
      <Avatar size={56}>L</Avatar>
    </Stack>
  ),
};

export const Rounded: Story = {
  args: {
    variant: 'rounded',
    children: 'AB',
  },
};
