import type { Story, Meta } from '@storybook/react';
import { Sparkline } from './sparkline';

export default {
  component: Sparkline,
  title: 'Sparkline',
} as Meta;

const Template: Story = (args) => <Sparkline data={args['data']} {...args} />;

export const Equal = Template.bind({});
Equal.args = {
  data: [
    12, 2, 3, 4, 5, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 6, 7, 8, 9,
    10, 11, 12,
  ],
  width: 110,
  height: 30,
};

export const Increase = Template.bind({});
Increase.args = {
  data: [
    22,
    22,
    22, // extra values should be ignored, this should still render an increase
    0,
    2,
    3,
    4,
    5,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
  ],
  width: 110,
  height: 30,
};

export const Decrease = Template.bind({});
Decrease.args = {
  data: [
    12, 2, 3, 4, 5, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 6, 7, 8, 9,
    10, 11, 1,
  ],
  width: 110,
  height: 30,
};

export const LessThan24HoursIncrease = Template.bind({});
LessThan24HoursIncrease.args = {
  data: [20, 21, 22, 25, 24, 24, 22, 19, 20, 22, 23, 27],
  width: 110,
  height: 30,
};

export const LessThan24HoursDecrease = Template.bind({});
LessThan24HoursDecrease.args = {
  data: [20, 21, 22, 23, 24, 6, 7, 9, 11, 13, 11, 9],
  width: 110,
  height: 30,
};

export const NoData = Template.bind({});
NoData.args = {
  data: [],
  width: 110,
  height: 30,
};
