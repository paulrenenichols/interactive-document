import type { Meta, StoryObj } from '@storybook/react';
import { CircularProgress } from './CircularProgress';

const meta: Meta<typeof CircularProgress> = {
  component: CircularProgress,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['indeterminate', 'determinate'],
    },
    value: { control: { type: 'number', min: 0, max: 100 } },
  },
};

export default meta;

type Story = StoryObj<typeof CircularProgress>;

export const Indeterminate: Story = {
  args: {
    variant: 'indeterminate',
  },
};

export const Determinate: Story = {
  args: {
    variant: 'determinate',
    value: 60,
  },
};

