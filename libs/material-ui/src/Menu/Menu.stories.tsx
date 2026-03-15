import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Menu, MenuItem } from './Menu';
import { Button } from '../Button';

const meta: Meta<typeof Menu> = {
  component: Menu,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Menu>;

export const Default: Story = {
  render: function DefaultMenu() {
    const [open, setOpen] = useState(false);
    return (
      <Menu
        open={open}
        onClose={() => setOpen(false)}
        anchor={
          <Button variant="outlined" onClick={() => setOpen((v) => !v)}>
            Open menu
          </Button>
        }
      >
        <MenuItem onClick={() => setOpen(false)}>Profile</MenuItem>
        <MenuItem onClick={() => setOpen(false)}>Settings</MenuItem>
        <MenuItem onClick={() => setOpen(false)}>Logout</MenuItem>
      </Menu>
    );
  },
};

export const WithDisabledItem: Story = {
  render: function WithDisabledItem() {
    const [open, setOpen] = useState(false);
    return (
      <Menu
        open={open}
        onClose={() => setOpen(false)}
        anchor={
          <Button variant="filled" onClick={() => setOpen((v) => !v)}>
            Actions
          </Button>
        }
      >
        <MenuItem onClick={() => setOpen(false)}>Edit</MenuItem>
        <MenuItem disabled>Duplicate (disabled)</MenuItem>
        <MenuItem onClick={() => setOpen(false)}>Delete</MenuItem>
      </Menu>
    );
  },
};
