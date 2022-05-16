import type { Story, Meta } from '@storybook/react';
import { Sparkline } from './sparkline';

export default {
  component: Sparkline,
  title: 'Sparkline',
} as Meta;

const Template: Story = (args) => <Sparkline data={args['data']} {...args} />;

export const Grey = Template.bind({});
Grey.args = {
  data: [
    1, 2, 3, 4, 5, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 6, 7, 8,
  ],
  width: 60,
  height: 30,
  points: 25,
  className: 'w-[113px]',
};

export const Equal = Template.bind({});
Equal.args = {
  data: [
    12, 2, 3, 4, 5, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 6, 7, 8, 9,
    10, 11, 12,
  ],
  width: 60,
  height: 30,
  points: 25,
  className: 'w-[113px]',
};

export const Increase = Template.bind({});
Increase.args = {
  data: [
    1, 2, 3, 4, 5, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 6, 7, 8, 9,
    10, 11, 12,
  ],
  width: 60,
  height: 30,
  points: 25,
  className: 'w-[113px]',
};

export const Decrease = Template.bind({});
Decrease.args = {
  data: [
    12, 2, 3, 4, 5, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 6, 7, 8, 9,
    10, 11, 1,
  ],
  width: 60,
  height: 30,
  points: 25,
  className: 'w-[113px]',
};
