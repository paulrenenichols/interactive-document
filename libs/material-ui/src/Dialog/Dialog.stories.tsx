import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from '../Button';

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  args: {
    open: true,
    onClose: () => {},
    title: 'Dialog title',
    children: 'Dialog body content goes here.',
    actions: (
      <>
        <Button variant="text" onClick={() => {}}>
          Cancel
        </Button>
        <Button variant="filled" onClick={() => {}}>
          Confirm
        </Button>
      </>
    ),
  },
};

export const WithTrigger: Story = {
  render: function WithTrigger() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="filled" onClick={() => setOpen(true)}>
          Open dialog
        </Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Confirm action"
          actions={
            <>
              <Button variant="text" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="filled" onClick={() => setOpen(false)}>
                OK
              </Button>
            </>
          }
        >
          Are you sure you want to continue?
        </Dialog>
      </>
    );
  },
};

export const NoTitle: Story = {
  args: {
    open: true,
    onClose: () => {},
    children: 'Dialog without a title.',
    actions: <Button variant="filled">Close</Button>,
  },
};
