import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Backdrop } from './Backdrop';
import { Button } from '../Button';

const meta: Meta<typeof Backdrop> = {
  component: Backdrop,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Backdrop>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="relative h-48">
        <Button onClick={() => setOpen(true)}>Show backdrop</Button>
        <Backdrop open={open} onClick={() => setOpen(false)} />
      </div>
    );
  },
};

