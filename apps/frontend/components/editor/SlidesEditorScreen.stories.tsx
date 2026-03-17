import type { Meta, StoryObj } from '@storybook/react';
import { SlidesEditorScreen } from './SlidesEditorScreen';

const meta: Meta<typeof SlidesEditorScreen> = {
  title: 'Editor/SlidesEditorScreen',
  component: SlidesEditorScreen,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SlidesEditorScreen>;

const baseSlides = [
  { id: 's-1', title: 'Executive summary' },
  { id: 's-2', title: 'KPI overview' },
  { id: 's-3', title: 'Deep-dive: revenue' },
];

export const DefaultDeck: Story = {
  args: {
    deckTitle: 'Marketing performance Q4',
    slides: baseSlides,
    selectedSlideId: 's-2',
    blocks: [
      {
        id: 'b-1',
        type: 'text',
        content:
          'This slide shows a mocked version of the editor layout using Storybook-only data.',
      },
      {
        id: 'b-2',
        type: 'chart',
        chartLabel: 'Revenue by month (mock)',
      },
    ],
  },
};

export const EmptyDeck: Story = {
  args: {
    deckTitle: 'Empty deck',
    slides: [],
    selectedSlideId: null,
    blocks: [],
  },
};

export const TextOnlySlide: Story = {
  args: {
    deckTitle: 'Narrative walkthrough',
    slides: baseSlides.slice(0, 1),
    selectedSlideId: 's-1',
    blocks: [
      {
        id: 'b-1',
        type: 'text',
        content:
          'Use this state to explore how long-form narrative content feels on the canvas.',
      },
    ],
  },
};

