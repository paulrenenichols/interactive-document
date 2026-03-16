import type { Meta, StoryObj } from '@storybook/react';
import { FAB } from './FAB';

const PlusIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const meta: Meta<typeof FAB> = {
  component: FAB,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    variant: { control: 'select', options: ['surface', 'primary', 'secondary', 'tertiary'] },
    extended: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof FAB>;

export const Default: Story = {
  render: () => (
    <FAB>
      <PlusIcon />
    </FAB>
  ),
};

export const Primary: Story = {
  render: () => (
    <FAB variant="primary">
      <PlusIcon />
    </FAB>
  ),
};

export const Extended: Story = {
  render: () => (
    <FAB extended>
      <PlusIcon />
      <span>Create</span>
    </FAB>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <FAB size="small">
        <PlusIcon />
      </FAB>
      <FAB size="medium">
        <PlusIcon />
      </FAB>
      <FAB size="large">
        <PlusIcon />
      </FAB>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <FAB disabled>
      <PlusIcon />
    </FAB>
  ),
};
