import type { Story, Meta } from '@storybook/react';
import type { TooltipProps } from './tooltip';
import { Tooltip } from './tooltip';

export default {
  component: Tooltip,
  title: 'Tooltip',
} as Meta;

const Template: Story<TooltipProps> = (args) => <Tooltip {...args} />;

export const Uncontrolled = Template.bind({});
Uncontrolled.args = {
  children: <button>Hover on me!</button>,
  description: 'Tooltip content!',
};

export const Controlled = Template.bind({});
Controlled.args = {
  children: <button>Already open</button>,
  description: 'Tooltip content!',
  open: true,
};
