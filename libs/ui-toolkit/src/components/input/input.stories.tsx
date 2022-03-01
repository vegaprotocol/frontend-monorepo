import { Story, Meta } from '@storybook/react';
import { Input } from './input';

export default {
  component: Input,
  title: 'Input',
} as Meta;

const Template: Story = (args) => <Input {...args} value="I type words" />;

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
