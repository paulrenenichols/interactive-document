import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '.';
import { Typography } from '../Typography';

const meta: Meta<typeof Table> = {
  component: Table,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Table>;

export const Default: Story = {
  args: {
    children: (
      <>
        <TableHead>
          <TableRow>
            <TableCell variant="head">Name</TableCell>
            <TableCell variant="head">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <Typography variant="body2">Row 1</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">Active</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography variant="body2">Row 2</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">Pending</Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </>
    ),
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    children: (
      <>
        <TableHead>
          <TableRow>
            <TableCell variant="head">A</TableCell>
            <TableCell variant="head">B</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>1</TableCell>
            <TableCell>2</TableCell>
          </TableRow>
        </TableBody>
      </>
    ),
  },
};
