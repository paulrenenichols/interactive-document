import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';

const meta: Meta<typeof Accordion> = {
  component: Accordion,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Accordion>;

export const Single: Story = {
  args: {
    summary: 'Accordion item',
    children: 'Accordion content goes here.',
  },
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-2">
      <Accordion summary="First">
        Content for the first accordion item.
      </Accordion>
      <Accordion summary="Second" defaultExpanded>
        Content for the second accordion item.
      </Accordion>
      <Accordion summary="Third" disabled>
        Disabled accordion item.
      </Accordion>
    </div>
  ),
};

