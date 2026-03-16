import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import { Stack } from '../Stack';

const meta: Meta<typeof Icon> = {
  component: Icon,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Icon>;

const StarIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export const Default: Story = {
  args: {
    children: <StarIcon />,
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Icon size={16}>
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </Icon>
      <Icon size={24}>
        <StarIcon />
      </Icon>
      <Icon size={32}>
        <StarIcon />
      </Icon>
    </Stack>
  ),
};

export const Colors: Story = {
  render: () => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Icon color="primary">
        <StarIcon />
      </Icon>
      <Icon color="secondary">
        <StarIcon />
      </Icon>
      <Icon color="muted">
        <StarIcon />
      </Icon>
    </Stack>
  ),
};
