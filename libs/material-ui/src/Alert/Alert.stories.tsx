import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';
import { Button } from '../Button';

const meta: Meta<typeof Alert> = {
  component: Alert,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    severity: 'info',
    title: 'Information',
    children: 'This is an informational alert.',
  },
};

export const Success: Story = {
  args: {
    severity: 'success',
    title: 'Success',
    children: 'Your action was successful.',
  },
};

export const WarningWithAction: Story = {
  args: {
    severity: 'warning',
    title: 'Warning',
    children: 'Changes have not been saved.',
    action: <Button variant="text">Review</Button>,
  },
};

export const Dismissible: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    if (!open) return null;
    return (
      <Alert
        severity="error"
        title="Error"
        onClose={() => setOpen(false)}
      >
        Something went wrong. Try again.
      </Alert>
    );
  },
};

