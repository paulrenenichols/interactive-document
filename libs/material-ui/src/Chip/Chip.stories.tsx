import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from './Chip';
import { Stack } from '../Stack';

const meta: Meta<typeof Chip> = {
  component: Chip,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Chip>;

export const Filled: Story = {
  args: {
    children: 'Chip',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: 'Outlined',
  },
};

export const Deletable: Story = {
  args: {
    children: 'Deletable',
    onDelete: () => {},
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    children: 'Small',
  },
};

export const Group: Story = {
  render: () => (
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip>One</Chip>
      <Chip variant="outlined">Two</Chip>
      <Chip onDelete={() => {}}>Three</Chip>
    </Stack>
  ),
};
