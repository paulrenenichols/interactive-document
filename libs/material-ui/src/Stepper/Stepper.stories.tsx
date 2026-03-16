import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from './Stepper';

const meta: Meta<typeof Stepper> = {
  component: Stepper,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Stepper>;

export const Default: Story = {
  args: {
    activeStep: 1,
    steps: [
      { label: 'Select campaign', description: 'Choose a campaign to configure.' },
      { label: 'Configure settings', description: 'Adjust targeting and budget.' },
      { label: 'Review and launch' },
    ],
  },
};

