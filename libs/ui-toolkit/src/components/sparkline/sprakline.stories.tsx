import type { Story, Meta } from '@storybook/react';
import { Sparkline } from './sparkline';

export default {
  component: Sparkline,
  title: 'Sparkline',
} as Meta;

const Template: Story = (args) => (
  <Sparkline data={[1, 2, 3, 2, 1, 4, 5, 6, 4, 3]} {...args} />
);

export const Normal = Template.bind({});
Normal.args = {
  data: [1, 2, 3, 2, 1, 4, 5, 6, 4, 3],
  points: [3, 4, 5],
};
