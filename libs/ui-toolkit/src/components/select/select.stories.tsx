import type { Story, Meta } from '@storybook/react';
import { Select } from './select';

export default {
  component: Select,
  title: 'Select',
} as Meta;

const Template: Story = (args) => (
  <Select {...args}>
    <option value="Only option">Only option</option>
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
