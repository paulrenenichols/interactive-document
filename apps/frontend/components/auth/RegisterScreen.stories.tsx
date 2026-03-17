import type { Meta, StoryObj } from '@storybook/react';
import { RegisterScreen } from './RegisterScreen';

const meta: Meta<typeof RegisterScreen> = {
  title: 'Auth/RegisterScreen',
  component: RegisterScreen,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof RegisterScreen>;

export const Default: Story = {
  args: {
    state: {
      email: '',
      password: '',
      confirmPassword: '',
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
      confirmPassword: 'password123',
      loading: true,
      error: undefined,
    },
  },
};

export const WithValidationError: Story = {
  args: {
    state: {
      email: 'user@example.com',
      password: 'short',
      confirmPassword: 'mismatch',
      loading: false,
      error: 'Passwords do not match',
    },
  },
};

