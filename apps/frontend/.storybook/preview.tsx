import type { Preview } from '@storybook/react';
import React, { useEffect } from 'react';
import '../app/globals.css';

/** Syncs Storybook theme toolbar with our app's .dark class so charts (and any var() usage) respond to dark mode. */
function ThemeDecorator(
  Story: React.ComponentType,
  context: { globals?: { theme?: string } }
) {
  const theme = context.globals?.theme;
  const isDark =
    theme === 'dark' ||
    (theme !== 'light' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    return () => root.classList.remove('dark');
  }, [isDark]);

  return (
    <div className={isDark ? 'dark' : ''} style={{ minHeight: '100vh' }}>
      <Story />
    </div>
  );
}

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'App theme (for charts and CSS variables)',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
      defaultValue: 'light',
    },
  },
  decorators: [ThemeDecorator],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
