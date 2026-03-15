import type { Meta, StoryObj } from '@storybook/react';
import { Paper } from './Paper';

const meta: Meta<typeof Paper> = {
  component: Paper,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Paper>;

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    className: 'p-4',
    children: 'Elevated paper content',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    className: 'p-4',
    children: 'Outlined paper content',
  },
};
