import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  component: Breadcrumbs,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Breadcrumbs>;

export const BasicTrail: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Catalog', href: '#' },
      { label: 'Components' },
    ],
  },
};

