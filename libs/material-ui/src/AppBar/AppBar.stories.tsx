import type { Meta, StoryObj } from '@storybook/react';
import { AppBar } from './AppBar';
import { IconButton } from '../IconButton';
import { Button } from '../Button';

const meta: Meta<typeof AppBar> = {
  component: AppBar,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AppBar>;

const MenuIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const CenterAligned: Story = {
  args: {
    variant: 'center-aligned',
    leading: (
      <IconButton aria-label="Menu">
        <MenuIcon />
      </IconButton>
    ),
    title: 'Center-aligned app bar',
    trailing: <Button variant="text">Action</Button>,
  },
};

export const Small: Story = {
  args: {
    variant: 'small',
    title: 'Small app bar',
  },
};

export const Large: Story = {
  args: {
    variant: 'large',
    title: 'Large app bar',
  },
};

