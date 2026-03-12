import type { Meta, StoryObj } from '@storybook/react';
import { LineChart } from './LineChart';

const meta: Meta<typeof LineChart> = {
  title: 'Charts/LineChart',
  component: LineChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LineChart>;

const sampleData = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 3800 },
  { month: 'Mar', revenue: 5100 },
  { month: 'Apr', revenue: 4700 },
  { month: 'May', revenue: 5500 },
  { month: 'Jun', revenue: 6200 },
];

export const Default: Story = {
  args: {
    data: sampleData,
    config: {
      categoryKey: 'month',
      valueKey: 'revenue',
    },
    height: 300,
  },
};

export const WithMultipleSeries: Story = {
  args: {
    data: [
      { month: 'Jan', value: 4200, metric: 'Revenue' },
      { month: 'Jan', value: 2800, metric: 'Cost' },
      { month: 'Feb', value: 3800, metric: 'Revenue' },
      { month: 'Feb', value: 2600, metric: 'Cost' },
      { month: 'Mar', value: 5100, metric: 'Revenue' },
      { month: 'Mar', value: 3100, metric: 'Cost' },
      { month: 'Apr', value: 4700, metric: 'Revenue' },
      { month: 'Apr', value: 2900, metric: 'Cost' },
    ],
    config: {
      categoryKey: 'month',
      valueKey: 'value',
      seriesKey: 'metric',
    },
    height: 300,
  },
};

export const TrendData: Story = {
  args: {
    data: [
      { day: 'Mon', users: 120 },
      { day: 'Tue', users: 150 },
      { day: 'Wed', users: 180 },
      { day: 'Thu', users: 140 },
      { day: 'Fri', users: 200 },
      { day: 'Sat', users: 250 },
      { day: 'Sun', users: 220 },
    ],
    config: {
      categoryKey: 'day',
      valueKey: 'users',
    },
    height: 280,
  },
};
