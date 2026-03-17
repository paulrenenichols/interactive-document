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
      rememberMe: false,
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
      rememberMe: true,
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
      rememberMe: false,
      loading: false,
      error: 'Invalid email or password',
    },
  },
};

export const ReturningUserRemembered: Story = {
  args: {
    state: {
      email: 'returning.user@example.com',
      password: '',
      rememberMe: true,
      loading: false,
      error: undefined,
    },
    footerSlot: (
      <p className="text-xs text-accent-foreground/70">
        You&apos;re signed in on this device. We&apos;ll keep you logged in unless you sign out.
      </p>
    ),
  },
};

export const FirstTimeUser: Story = {
  args: {
    state: {
      email: '',
      password: '',
      rememberMe: false,
      loading: false,
      error: undefined,
    },
    footerSlot: (
      <p className="text-xs text-accent-foreground/70">
        First time here? Use the &quot;Create an account&quot; link to get started.
      </p>
    ),
  },
};

