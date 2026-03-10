import type { Meta, StoryObj } from '@storybook/react';
import { AreaChart } from './AreaChart';

const meta: Meta<typeof AreaChart> = {
  title: 'Charts/AreaChart',
  component: AreaChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AreaChart>;

const sampleData = [
  { month: 'Jan', visitors: 4200 },
  { month: 'Feb', visitors: 3800 },
  { month: 'Mar', visitors: 5100 },
  { month: 'Apr', visitors: 4700 },
  { month: 'May', visitors: 5500 },
  { month: 'Jun', visitors: 6200 },
];

export const Default: Story = {
  args: {
    data: sampleData,
    config: {
      categoryKey: 'month',
      valueKey: 'visitors',
    },
    height: 300,
  },
};

export const StackedSeries: Story = {
  args: {
    data: [
      { month: 'Jan', value: 4200, source: 'Organic' },
      { month: 'Jan', value: 2800, source: 'Paid' },
      { month: 'Feb', value: 3800, source: 'Organic' },
      { month: 'Feb', value: 2600, source: 'Paid' },
      { month: 'Mar', value: 5100, source: 'Organic' },
      { month: 'Mar', value: 3100, source: 'Paid' },
      { month: 'Apr', value: 4700, source: 'Organic' },
      { month: 'Apr', value: 2900, source: 'Paid' },
    ],
    config: {
      categoryKey: 'month',
      valueKey: 'value',
      seriesKey: 'source',
    },
    height: 300,
  },
};

export const ResourceUsage: Story = {
  args: {
    data: [
      { time: '00:00', cpu: 45 },
      { time: '04:00', cpu: 32 },
      { time: '08:00', cpu: 78 },
      { time: '12:00', cpu: 85 },
      { time: '16:00', cpu: 72 },
      { time: '20:00', cpu: 55 },
      { time: '24:00', cpu: 40 },
    ],
    config: {
      categoryKey: 'time',
      valueKey: 'cpu',
    },
    height: 280,
  },
};
