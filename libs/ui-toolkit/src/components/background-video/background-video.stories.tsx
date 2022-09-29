import type { Story, Meta } from '@storybook/react';
import { BackgroundVideo } from './background-video';

export default {
  component: BackgroundVideo,
  title: 'BackgroundVideo',
} as Meta;

export const Default: Story = () => <BackgroundVideo />;
