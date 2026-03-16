import type { Meta, StoryObj } from '@storybook/react';
import { NumberField } from './NumberField';

const meta: Meta<typeof NumberField> = {
  component: NumberField,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    showStepper: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof NumberField>;

export const Default: Story = {
  args: { defaultValue: 0 },
};

export const WithLabel: Story = {
  args: { label: 'Quantity', defaultValue: 1, min: 0, max: 99 },
};

export const WithStepper: Story = {
  args: { defaultValue: 5, min: 0, max: 10, step: 1 },
};

export const NoStepper: Story = {
  args: { defaultValue: 42, showStepper: false },
};

export const Disabled: Story = {
  args: { label: 'Disabled', defaultValue: 3, disabled: true },
};
