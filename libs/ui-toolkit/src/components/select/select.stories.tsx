import type { Story, Meta } from '@storybook/react';
import { Select } from './select';
import { FormGroup } from '../form-group';

export default {
  component: Select,
  title: 'Select',
} as Meta;

const Template: Story = (args) => (
  <FormGroup labelClassName="sr-only" label="Hello" labelFor={args.id}>
    <Select {...args}>
      <option value="Option 1">Option 1</option>
      <option value="Option 2">Option 2</option>
      <option value="Option 3">Option 3</option>
    </Select>
  </FormGroup>
);

export const Default = Template.bind({});
Default.args = {
  id: 'select-default',
};

export const WithError = Template.bind({});
WithError.args = {
  id: 'select-has-error',
  hasError: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  id: 'select-disabled',
  disabled: true,
};
