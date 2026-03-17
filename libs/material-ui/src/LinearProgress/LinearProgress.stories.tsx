import type { Meta, StoryObj } from '@storybook/react';
import { LinearProgress } from './LinearProgress';

const meta: Meta<typeof LinearProgress> = {
  component: LinearProgress,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['indeterminate', 'determinate', 'buffer'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof LinearProgress>;

export const Indeterminate: Story = {
  args: {
    variant: 'indeterminate',
  },
};

export const Determinate: Story = {
  args: {
    variant: 'determinate',
    value: 45,
  },
};

export const Buffer: Story = {
  args: {
    variant: 'buffer',
    value: 35,
    valueBuffer: 60,
  },
};

