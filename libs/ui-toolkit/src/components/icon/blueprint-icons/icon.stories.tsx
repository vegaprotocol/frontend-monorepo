import type { Story, Meta } from '@storybook/react';
import type { IconProps } from './icon';
import { Icon } from './icon';

export default {
  component: Icon,
  title: 'Icon',
} as Meta;

const Template: Story<IconProps> = (args) => <Icon {...args} />;

export const Default = Template.bind({});
Default.args = {
  name: 'warning-sign',
};

export const Bigger = Template.bind({});
Bigger.args = {
  name: 'updated',
  size: 8,
};

export const EvenBigger = Template.bind({});
EvenBigger.args = {
  name: 'area-of-interest',
  size: 12,
};
