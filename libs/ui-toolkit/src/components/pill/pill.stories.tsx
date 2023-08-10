import type { Story, Meta } from '@storybook/react';
import { Pill } from './pill';
import { Intent } from '../../utils/intent';

export default {
  component: Pill,
  title: 'Pill',
} as Meta;

const Template: Story = (args) => <Pill {...args}>Pill</Pill>;

export const Default = Template.bind({ intent: Intent.Primary, size: 'md' });

export const None = Template.bind({});
None.args = {
  intent: Intent.None,
  size: 'md',
};

export const Info = Template.bind({});
Info.args = {
  intent: Intent.Info,
  size: 'md',
};

export const Primary = Template.bind({});
Primary.args = {
  intent: Intent.Primary,
  size: 'md',
};

export const Success = Template.bind({});
Success.args = {
  intent: Intent.Success,
  size: 'md',
};

export const Warning = Template.bind({});
Warning.args = {
  intent: Intent.Warning,
  size: 'md',
};

export const Danger = Template.bind({});
Danger.args = {
  intent: Intent.Danger,
  size: 'md',
};
