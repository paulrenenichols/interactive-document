import type { Meta, StoryObj } from '@storybook/react';
import { BottomNavigation } from './BottomNavigation';

const meta: Meta<typeof BottomNavigation> = {
  component: BottomNavigation,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof BottomNavigation>;

export const Default: Story = {
  args: {
    actions: [
      { label: 'Recents', value: 'recents', icon: '⏱' },
      { label: 'Favorites', value: 'favorites', icon: '★' },
      { label: 'Nearby', value: 'nearby', icon: '📍' },
    ],
  },
};

