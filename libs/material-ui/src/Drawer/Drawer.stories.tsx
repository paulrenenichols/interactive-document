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
    const mySetOpen = (openState: boolean) => {
      console.log('mySetOpen', openState);
      setOpen(openState);
    };
    return (
      <div className="h-48">
        <Button onClick={() => mySetOpen(true)}>Open drawer</Button>
        <Drawer open={open} onClose={() => mySetOpen(false)}>
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

export const WithArgs: Story = {
  args: {
    open: true,
    variant: 'temporary',
    anchor: 'left',
  },
  render: (args) => {
    const [open, setOpen] = React.useState(args.open);
    const mySetOpen = (openState: boolean) => {
      console.log('mySetOpen', openState);
      setOpen(openState);
    };
    const containerClick = (e: React.MouseEvent<HTMLDivElement>) => {
      console.log('containerClick');
      e.stopPropagation();
      e.preventDefault();
    };
    return (
      <div className="h-48" onClick={containerClick}>
        <Button onClick={() => mySetOpen(true)}>Open drawer (args)</Button>
        <Drawer {...args} open={open} onClose={() => mySetOpen(false)}>
          <div className="p-4 space-y-2">
            <p className="text-sm font-medium">Navigation (with args)</p>
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
