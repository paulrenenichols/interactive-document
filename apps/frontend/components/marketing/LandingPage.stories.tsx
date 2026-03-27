import type { Meta, StoryObj } from '@storybook/react';
import { LandingPage } from './LandingPage';

const meta: Meta<typeof LandingPage> = {
  title: 'Marketing/LandingPage',
  component: LandingPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof LandingPage>;

export const Default: Story = {};
