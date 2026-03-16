import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Snackbar } from './Snackbar';
import { Button } from '../Button';

const meta: Meta<typeof Snackbar> = {
  component: Snackbar,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Snackbar>;

export const Simple: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="space-y-4">
        <Button onClick={() => setOpen(true)}>Show snackbar</Button>
        <Snackbar
          open={open}
          onClose={() => setOpen(false)}
          message="Saved successfully."
        />
      </div>
    );
  },
};

export const WithAction: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        message="Message archived"
        action={
          <Button
            variant="text"
            className="text-bg-primary hover:bg-bg-primary/10"
          >
            Undo
          </Button>
        }
      />
    );
  },
};

