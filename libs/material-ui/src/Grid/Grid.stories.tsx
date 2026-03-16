import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from './Grid';
import { Paper } from '../Paper';
import { Typography } from '../Typography';

const meta: Meta<typeof Grid> = {
  component: Grid,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Grid>;

const Cell = ({ children }: { children: React.ReactNode }) => (
  <Paper variant="outlined" className="p-4">
    {children}
  </Paper>
);

export const ThreeColumns: Story = {
  args: {
    columns: 3,
    spacing: 2,
    children: (
      <>
        <Cell>
          <Typography variant="body2">Cell 1</Typography>
        </Cell>
        <Cell>
          <Typography variant="body2">Cell 2</Typography>
        </Cell>
        <Cell>
          <Typography variant="body2">Cell 3</Typography>
        </Cell>
      </>
    ),
  },
};

export const FourColumns: Story = {
  args: {
    columns: 4,
    spacing: 2,
    children: Array.from({ length: 8 }, (_, i) => (
      <Cell key={i}>
        <Typography variant="body2">Item {i + 1}</Typography>
      </Cell>
    )),
  },
};

export const AutoColumns: Story = {
  args: {
    columns: 'auto',
    spacing: 2,
    children: Array.from({ length: 5 }, (_, i) => (
      <Cell key={i}>
        <Typography variant="body2">Auto {i + 1}</Typography>
      </Cell>
    )),
  },
};
