import type { Meta, StoryObj } from '@storybook/react';
import { Link } from './Link';

const meta: Meta<typeof Link> = {
  component: Link,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Link>;

export const Default: Story = {
  render: () => (
    <Link href="https://example.com" target="_blank" rel="noreferrer">
      Example link
    </Link>
  ),
};

export const UnderlineAlways: Story = {
  render: () => (
    <Link
      href="#"
      underline="always"
    >
      Always underlined link
    </Link>
  ),
};

