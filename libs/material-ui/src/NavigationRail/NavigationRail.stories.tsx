import type { Meta, StoryObj } from '@storybook/react';
import { NavigationRail } from './NavigationRail';

const meta: Meta<typeof NavigationRail> = {
  component: NavigationRail,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof NavigationRail>;

export const Default: Story = {
  args: {
    actions: [
      { label: 'Home', value: 'home', icon: '🏠' },
      { label: 'Search', value: 'search', icon: '🔍' },
      { label: 'Profile', value: 'profile', icon: '👤' },
    ],
  },
};

