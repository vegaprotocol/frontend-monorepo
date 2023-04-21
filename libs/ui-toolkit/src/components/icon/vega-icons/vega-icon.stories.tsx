import type { Story, Meta } from '@storybook/react';
import type { VegaIconProps } from './vega-icon';
import { VegaIcon } from './vega-icon';

export default {
  component: VegaIcon,
  title: 'VegaIcon',
} as Meta;

const Template: Story<VegaIconProps> = (args) => <VegaIcon {...args} />;

export const Default = Template.bind({});
Default.args = {
  name: 'edit',
};

export const Bigger = Template.bind({});
Bigger.args = {
  name: 'deposit',
  size: 8,
};

export const EvenBigger = Template.bind({});
EvenBigger.args = {
  name: 'withdraw',
  size: 12,
};
