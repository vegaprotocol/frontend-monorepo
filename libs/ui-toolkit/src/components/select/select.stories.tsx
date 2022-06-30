import type { Story, Meta } from '@storybook/react';
import { Select } from './select';

export default {
  component: Select,
  title: 'Select',
} as Meta;

const Template: Story = (args) => (
  <Select {...args}>
    <option value="Option 1">Option 1</option>
    <option value="Option 2">Option 2</option>
    <option value="Option 3">Option 3</option>
  </Select>
);

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
