import type { Meta, StoryObj } from '@storybook/react';
import { Autocomplete } from './Autocomplete';

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'grape', label: 'Grape' },
  { value: 'orange', label: 'Orange' },
  { value: 'peach', label: 'Peach' },
  { value: 'pear', label: 'Pear' },
];

const meta: Meta<typeof Autocomplete> = {
  component: Autocomplete,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    freeSolo: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Autocomplete>;

export const Default: Story = {
  args: { options, placeholder: 'Search fruits' },
};

export const WithLabel: Story = {
  args: { options, label: 'Fruit', placeholder: 'Type to search' },
};

export const WithValue: Story = {
  args: { options, defaultValue: options[2] },
};

export const FullWidth: Story = {
  args: { options, label: 'Fruit', fullWidth: true },
};

export const FreeSolo: Story = {
  args: { options, freeSolo: true, placeholder: 'Type or choose' },
};
