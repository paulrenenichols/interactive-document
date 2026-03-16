import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    range: { control: 'boolean' },
    valueLabelDisplay: { control: 'select', options: ['auto', 'on', 'off'] },
  },
};

export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: { defaultValue: 50 },
};

export const WithLabel: Story = {
  args: { defaultValue: 30, valueLabelDisplay: 'on' },
};

export const Discrete: Story = {
  args: { defaultValue: 2, min: 0, max: 10, step: 1 },
};

export const Range: Story = {
  args: { range: true, defaultValue: [25, 75] },
};

export const Disabled: Story = {
  args: { defaultValue: 60, disabled: true },
};
