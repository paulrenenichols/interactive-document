import type { Meta, StoryObj } from '@storybook/react';
import { Box } from './Box';

const meta: Meta<typeof Box> = {
  component: Box,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Box>;

export const Default: Story = {
  args: {
    children: 'Box content',
    className: 'p-4 border border-border-default rounded-radius-small',
  },
};
