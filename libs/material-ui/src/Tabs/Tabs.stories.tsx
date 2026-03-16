import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Basic: Story = {
  args: {
    tabs: [
      { label: 'Overview', value: 'overview' },
      { label: 'Details', value: 'details' },
      { label: 'Settings', value: 'settings' },
    ],
  },
};

