import { Story, Meta } from '@storybook/react';
import { Tooltip, TooltipProps } from './tooltip';

export default {
  component: Tooltip,
  title: 'Tooltip',
} as Meta;

const Template: Story<TooltipProps> = (args) => <Tooltip {...args} />;

export const Uncontrolled = Template.bind({});
Uncontrolled.args = {
  children: <button>Click me!</button>,
  description: 'Tooltip content!',
};

export const Controlled = Template.bind({});
Controlled.args = {
  children: <button>Open me using the 'open' prop</button>,
  description: 'Tooltip content!',
  open: false,
};
