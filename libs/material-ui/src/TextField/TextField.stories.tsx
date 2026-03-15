import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from './TextField';

const meta: Meta<typeof TextField> = {
  component: TextField,
  tags: ['autodocs'],
  argTypes: {
    error: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: { placeholder: 'Enter text' },
};

export const WithLabel: Story = {
  args: { label: 'Label', placeholder: 'Enter text' },
};

export const WithHelperText: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    helperText: 'We will never share your email.',
  },
};

export const Error: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    error: true,
    helperText: 'Invalid email address.',
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full width',
    placeholder: 'Stretches to container',
    fullWidth: true,
  },
};

export const Disabled: Story = {
  args: { label: 'Disabled', placeholder: 'Disabled', disabled: true },
};
