import type { Meta, StoryObj } from '@storybook/react';
import { BarChart } from './BarChart';

const meta: Meta<typeof BarChart> = {
  title: 'Charts/BarChart',
  component: BarChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BarChart>;

const sampleData = [
  { month: 'Jan', sales: 4200, expenses: 2800 },
  { month: 'Feb', sales: 3800, expenses: 2600 },
  { month: 'Mar', sales: 5100, expenses: 3100 },
  { month: 'Apr', sales: 4700, expenses: 2900 },
  { month: 'May', sales: 5500, expenses: 3200 },
  { month: 'Jun', sales: 6200, expenses: 3500 },
];

export const Default: Story = {
  args: {
    data: sampleData,
    config: {
      categoryKey: 'month',
      valueKey: 'sales',
    },
    height: 300,
  },
};

export const WithSeries: Story = {
  args: {
    data: [
      { month: 'Jan', value: 4200, type: 'Sales' },
      { month: 'Jan', value: 2800, type: 'Expenses' },
      { month: 'Feb', value: 3800, type: 'Sales' },
      { month: 'Feb', value: 2600, type: 'Expenses' },
      { month: 'Mar', value: 5100, type: 'Sales' },
      { month: 'Mar', value: 3100, type: 'Expenses' },
    ],
    config: {
      categoryKey: 'month',
      valueKey: 'value',
      seriesKey: 'type',
    },
    height: 300,
  },
};

export const SmallDataset: Story = {
  args: {
    data: [
      { category: 'A', value: 100 },
      { category: 'B', value: 200 },
      { category: 'C', value: 150 },
    ],
    config: {
      categoryKey: 'category',
      valueKey: 'value',
    },
    height: 250,
  },
};
