import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    // Relative base: GH Pages serves this app under .../interactive-document/material-ui/;
    // `/material-ui/` made the iframe load assets from the domain root (404).
    return mergeConfig(config, {
      base: './',
    });
  },
};

export default config;
