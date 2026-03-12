import type { Meta, StoryObj } from '@storybook/react';
import { PieChart } from './PieChart';

const meta: Meta<typeof PieChart> = {
  title: 'Charts/PieChart',
  component: PieChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PieChart>;

export const Default: Story = {
  args: {
    data: [
      { category: 'Desktop', users: 4500 },
      { category: 'Mobile', users: 3200 },
      { category: 'Tablet', users: 1800 },
    ],
    config: {
      categoryKey: 'category',
      valueKey: 'users',
    },
    height: 350,
  },
};

export const MarketShare: Story = {
  args: {
    data: [
      { company: 'Company A', share: 35 },
      { company: 'Company B', share: 28 },
      { company: 'Company C', share: 20 },
      { company: 'Company D', share: 12 },
      { company: 'Others', share: 5 },
    ],
    config: {
      categoryKey: 'company',
      valueKey: 'share',
    },
    height: 350,
  },
};

export const Budget: Story = {
  args: {
    data: [
      { department: 'Engineering', budget: 500000 },
      { department: 'Marketing', budget: 300000 },
      { department: 'Sales', budget: 250000 },
      { department: 'Operations', budget: 200000 },
      { department: 'HR', budget: 100000 },
    ],
    config: {
      categoryKey: 'department',
      valueKey: 'budget',
    },
    height: 400,
  },
};
