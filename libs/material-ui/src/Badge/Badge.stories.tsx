import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';
import { Typography } from '../Typography';

const meta: Meta<typeof Badge> = {
  component: Badge,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Badge>;

// Placeholder icon (mail)
const MailIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

export const WithCount: Story = {
  args: {
    badgeContent: 4,
    children: <MailIcon />,
  },
};

export const WithZero: Story = {
  args: {
    badgeContent: 0,
    showZero: true,
    children: <MailIcon />,
  },
};

export const Dot: Story = {
  args: {
    variant: 'dot',
    children: <MailIcon />,
  },
};

export const ColorPrimary: Story = {
  args: {
    badgeContent: 9,
    color: 'primary',
    children: <MailIcon />,
  },
};

export const OnText: Story = {
  args: {
    badgeContent: 'New',
    children: (
      <Typography variant="body2" className="px-2">
        Label
      </Typography>
    ),
  },
};
