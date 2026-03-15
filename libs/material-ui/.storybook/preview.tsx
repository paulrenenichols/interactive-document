import type { Preview } from '@storybook/react';
import React, { useLayoutEffect } from 'react';
import '../src/theme.css';

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

  // Apply .dark on document root before first paint to avoid theme flash
  useLayoutEffect(() => {
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
      description: 'M3 theme',
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
  },
};

export default preview;
