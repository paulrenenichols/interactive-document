import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { BottomSheet } from './BottomSheet';
import { Button } from '../Button';

const meta: Meta<typeof BottomSheet> = {
  component: BottomSheet,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof BottomSheet>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="h-64">
        <Button onClick={() => setOpen(true)}>Open bottom sheet</Button>
        <BottomSheet open={open} onClose={() => setOpen(false)}>
          <div className="space-y-2 p-2 text-sm">
            <p className="font-medium">Bottom sheet</p>
            <p>
              Use bottom sheets for additional actions or context without leaving the
              current screen.
            </p>
          </div>
        </BottomSheet>
      </div>
    );
  },
};

