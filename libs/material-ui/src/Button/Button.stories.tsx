import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Filled: Story = {
  args: { variant: 'filled', children: 'Button' },
};

export const Outlined: Story = {
  args: { variant: 'outlined', children: 'Button' },
};

export const Text: Story = {
  args: { variant: 'text', children: 'Button' },
};

export const Disabled: Story = {
  args: { variant: 'filled', children: 'Disabled', disabled: true },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="filled">Filled</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="text">Text</Button>
    </div>
  ),
};
