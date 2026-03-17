import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './Container';
import { Typography } from '../Typography';

const meta: Meta<typeof Container> = {
  component: Container,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Container>;

export const Default: Story = {
  args: {
    children: (
      <Typography variant="body1">
        Content inside a container with max-width and horizontal padding. Resize
        the viewport to see the width cap. Uses theme-aligned breakpoints.
      </Typography>
    ),
  },
};

export const MaxWidthXs: Story = {
  args: {
    maxWidth: 'xs',
    children: (
      <Typography variant="body1">
        Narrow container (xs). Background uses bg-bg-secondary so the bounds are
        visible.
      </Typography>
    ),
    className: 'bg-bg-secondary dark:bg-bg-secondary rounded-radius-small p-4',
  },
};

export const NoGutters: Story = {
  args: {
    disableGutters: true,
    children: (
      <Typography variant="body1">
        Container without horizontal padding (disableGutters).
      </Typography>
    ),
  },
};
