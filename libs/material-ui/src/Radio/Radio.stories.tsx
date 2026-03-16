import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';

const meta: Meta<typeof Radio> = {
  component: Radio,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  args: { name: 'demo', value: 'a' },
};

export const WithLabel: Story = {
  args: { name: 'demo', value: 'a', label: 'Option A' },
};

export const Group: Story = {
  render: () => (
    <RadioGroup name="choice" defaultValue="b">
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
      <Radio value="c" label="Option C" />
    </RadioGroup>
  ),
};

export const GroupRow: Story = {
  render: () => (
    <RadioGroup name="choice-row" defaultValue="medium" row>
      <Radio value="small" label="Small" />
      <Radio value="medium" label="Medium" />
      <Radio value="large" label="Large" />
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  args: { name: 'demo', value: 'a', label: 'Disabled', disabled: true },
};
