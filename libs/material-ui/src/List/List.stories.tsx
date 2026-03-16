import type { Meta, StoryObj } from '@storybook/react';
import { List, ListItem } from './List';
import { Typography } from '../Typography';
import { Divider } from '../Divider';

const meta: Meta<typeof List> = {
  component: List,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof List>;

export const Default: Story = {
  args: {
    children: (
      <>
        <ListItem>
          <Typography variant="body1">First</Typography>
        </ListItem>
        <ListItem>
          <Typography variant="body1">Second</Typography>
        </ListItem>
        <ListItem>
          <Typography variant="body1">Third</Typography>
        </ListItem>
      </>
    ),
  },
};

export const WithDividers: Story = {
  args: {
    children: (
      <>
        <ListItem>
          <Typography variant="body1">One</Typography>
        </ListItem>
        <ListItem disablePadding>
          <Divider />
        </ListItem>
        <ListItem>
          <Typography variant="body1">Two</Typography>
        </ListItem>
        <ListItem disablePadding>
          <Divider />
        </ListItem>
        <ListItem>
          <Typography variant="body1">Three</Typography>
        </ListItem>
      </>
    ),
  },
};

export const Dense: Story = {
  args: {
    dense: true,
    children: (
      <>
        <ListItem>
          <Typography variant="body2">Dense item 1</Typography>
        </ListItem>
        <ListItem>
          <Typography variant="body2">Dense item 2</Typography>
        </ListItem>
      </>
    ),
  },
};
