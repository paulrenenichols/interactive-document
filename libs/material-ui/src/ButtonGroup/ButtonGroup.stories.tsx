import type { Meta, StoryObj } from '@storybook/react';
import { ButtonGroup } from './ButtonGroup';
import { Button } from '../Button';

const meta: Meta<typeof ButtonGroup> = {
  component: ButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    connected: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outlined">One</Button>
      <Button variant="outlined">Two</Button>
      <Button variant="outlined">Three</Button>
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outlined">One</Button>
      <Button variant="outlined">Two</Button>
      <Button variant="outlined">Three</Button>
    </ButtonGroup>
  ),
};

export const Filled: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="filled">Save</Button>
      <Button variant="filled">Cancel</Button>
    </ButtonGroup>
  ),
};
