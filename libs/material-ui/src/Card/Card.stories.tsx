import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardContent, CardActions, CardMedia } from './Card';
import { Button } from '../Button';

const meta: Meta<typeof Card> = {
  component: Card,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Simple: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardContent>
        <p className="text-sm">
          This is a simple card with content only.
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithHeaderAndActions: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader
        title="Card title"
        subheader="Secondary text"
      />
      <CardContent>
        <p className="text-sm">
          Use cards to group related content and actions.
        </p>
      </CardContent>
      <CardActions>
        <Button variant="text">Cancel</Button>
        <Button>Save</Button>
      </CardActions>
    </Card>
  ),
};

export const WithMedia: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardMedia
        src="https://picsum.photos/400/200"
        alt="Random"
      />
      <CardHeader
        title="Media card"
        subheader="Supporting text"
      />
      <CardContent>
        <p className="text-sm">
          Media cards display images above supporting content and actions.
        </p>
      </CardContent>
      <CardActions>
        <Button variant="text">Share</Button>
        <Button>Learn more</Button>
      </CardActions>
    </Card>
  ),
};

