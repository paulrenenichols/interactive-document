import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../Stack';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  component: Typography,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Typography>;

export const AllVariants: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h1">Heading 1</Typography>
      <Typography variant="h2">Heading 2</Typography>
      <Typography variant="body1">Body 1 text</Typography>
      <Typography variant="body2">Body 2 text</Typography>
      <Typography variant="caption">Caption</Typography>
      <Typography variant="overline">Overline</Typography>
    </Stack>
  ),
};
