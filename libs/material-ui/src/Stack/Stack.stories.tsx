import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';

const meta: Meta<typeof Stack> = {
  component: Stack,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Stack>;

export const Column: Story = {
  args: {
    spacing: 2,
    children: (
      <>
        <span>Item 1</span>
        <span>Item 2</span>
        <span>Item 3</span>
      </>
    ),
  },
};

export const Row: Story = {
  args: {
    direction: 'row',
    spacing: 2,
    children: (
      <>
        <span>Item 1</span>
        <span>Item 2</span>
        <span>Item 3</span>
      </>
    ),
  },
};
