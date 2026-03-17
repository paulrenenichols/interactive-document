import type { Meta, StoryObj } from '@storybook/react';
import { LoginScreen } from './LoginScreen';

const meta: Meta<typeof LoginScreen> = {
  title: 'Auth/LoginScreen',
  component: LoginScreen,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof LoginScreen>;

export const Default: Story = {
  args: {
    state: {
      email: '',
      password: '',
      loading: false,
      error: undefined,
    },
  },
};

export const Loading: Story = {
  args: {
    state: {
      email: 'user@example.com',
      password: 'password123',
      loading: true,
      error: undefined,
    },
  },
};

export const WithError: Story = {
  args: {
    state: {
      email: 'user@example.com',
      password: 'password123',
      loading: false,
      error: 'Invalid email or password',
    },
  },
};

