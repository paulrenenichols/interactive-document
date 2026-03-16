import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date', disabled: true },
  { value: 'elderberry', label: 'Elderberry' },
];

const meta: Meta<typeof Select> = {
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: { options, placeholder: 'Choose fruit' },
};

export const WithLabel: Story = {
  args: { options, label: 'Fruit', placeholder: 'Choose one' },
};

export const WithValue: Story = {
  args: { options, defaultValue: 'banana' },
};

export const FullWidth: Story = {
  args: { options, label: 'Fruit', fullWidth: true },
};

export const Disabled: Story = {
  args: { options, defaultValue: 'cherry', disabled: true },
};
