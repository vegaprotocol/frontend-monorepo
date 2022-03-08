import { Story, Meta } from '@storybook/react';
import { Icon } from './icon';

export default {
  component: Icon,
  title: 'Input',
} as Meta;

const Template: Story = (args) => <Icon {...args} name="warning-sign" />;

export const Default = Template.bind({});
Default.args = {};

export const WithError = Template.bind({});
WithError.args = {
  hasError: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};
