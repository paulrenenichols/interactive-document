import type { Meta, StoryObj } from '@storybook/react';
import { Rating } from './Rating';

const meta: Meta<typeof Rating> = {
  component: Rating,
  tags: ['autodocs'],
  argTypes: {
    readOnly: { control: 'boolean' },
    disabled: { control: 'boolean' },
    precision: { control: 'select', options: [0.5, 1] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
};

export default meta;

type Story = StoryObj<typeof Rating>;

export const Default: Story = {
  args: {},
};

export const WithValue: Story = {
  args: { defaultValue: 3 },
};

export const HalfPrecision: Story = {
  args: { defaultValue: 2.5, precision: 0.5 },
};

export const ReadOnly: Story = {
  args: { value: 4, readOnly: true },
};

export const Disabled: Story = {
  args: { defaultValue: 2, disabled: true },
};

export const Small: Story = {
  args: { defaultValue: 3, size: 'small' },
};
