import { dirname, join } from 'node:path';

import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {},
  },
};

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}

export default config;
