import type { Meta, StoryObj } from '@storybook/react';
import { ToggleButton } from './ToggleButton';
import { ToggleButtonGroup } from './ToggleButtonGroup';

const meta: Meta<typeof ToggleButton> = {
  component: ToggleButton,
  tags: ['autodocs'],
  argTypes: {
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof ToggleButton>;

export const Default: Story = {
  args: { children: 'Toggle' },
};

export const Selected: Story = {
  args: { children: 'On', selected: true },
};

export const ExclusiveGroup: Story = {
  render: () => (
    <ToggleButtonGroup exclusive defaultValue="left">
      <ToggleButton value="left">Left</ToggleButton>
      <ToggleButton value="center">Center</ToggleButton>
      <ToggleButton value="right">Right</ToggleButton>
    </ToggleButtonGroup>
  ),
};

export const MultipleGroup: Story = {
  render: () => (
    <ToggleButtonGroup exclusive={false} defaultValue={['bold']}>
      <ToggleButton value="bold">Bold</ToggleButton>
      <ToggleButton value="italic">Italic</ToggleButton>
      <ToggleButton value="underline">Underline</ToggleButton>
    </ToggleButtonGroup>
  ),
};
