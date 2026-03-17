import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Button } from '../Button';
import { Typography } from '../Typography';

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    title: 'Tooltip text',
    children: <Button>Hover me</Button>,
  },
};

export const PlacementTop: Story = {
  args: {
    title: 'Top',
    placement: 'top',
    children: <span className="text-text-primary dark:text-text-primary">Hover</span>,
  },
};

export const PlacementBottom: Story = {
  args: {
    title: 'Bottom',
    placement: 'bottom',
    children: <Button variant="outlined">Hover</Button>,
  },
};

export const WithDelay: Story = {
  args: {
    title: 'Appears after 500ms',
    enterDelay: 500,
    leaveDelay: 200,
    children: <Typography variant="body2">Hover (delayed)</Typography>,
  },
};
