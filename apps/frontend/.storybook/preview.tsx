import type { Preview } from '@storybook/react';
import React, { useLayoutEffect } from 'react';
import '../app/globals.css';

/** Syncs Storybook theme toolbar with `html.dark` so `globals.css` tokens and Tailwind utilities both track. */
function ThemeDecorator(
  Story: React.ComponentType,
  context: { globals?: { theme?: string } }
) {
  const theme = context.globals?.theme ?? 'light';
  const isDark = theme === 'dark';

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    return () => {
      root.classList.toggle('dark', false);
    };
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
