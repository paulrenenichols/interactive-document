import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Drawer } from './Drawer';
import { Button } from '../Button';

const meta: Meta<typeof Drawer> = {
  component: Drawer,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Drawer>;

export const Temporary: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="h-48">
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        <Drawer open={open} onClose={() => setOpen(false)}>
          <div className="p-4 space-y-2">
            <p className="text-sm font-medium">Navigation</p>
            <Button variant="text" className="w-full justify-start">
              Item one
            </Button>
            <Button variant="text" className="w-full justify-start">
              Item two
            </Button>
          </div>
        </Drawer>
      </div>
    );
  },
};

