import { Story, Meta } from '@storybook/react';
import { InputError } from './inputError';

export default {
  component: InputError,
  title: 'InputError',
} as Meta;

const Template: Story = (args) => <InputError {...args} />;

export const Danger = Template.bind({});
Danger.args = {
  children: 'An error that might have happened',
};

export const Warning = Template.bind({});
Warning.args = {
  intent: 'warning',
  children: 'Something that might be an issue',
};
