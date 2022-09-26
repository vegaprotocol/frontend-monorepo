import type { Story, Meta } from '@storybook/react';
import { Input } from './input';
import { FormGroup } from '../form-group';
export default {
  component: Input,
  title: 'Input',
} as Meta;

const Template: Story = (args) => (
  <FormGroup label="Hello" labelFor={args.id}>
    <Input value="I type words" {...args} />
  </FormGroup>
);

const customElementPlaceholder = (
  <span
    style={{
      fontFamily: 'monospace',
      backgroundColor: 'grey',
      padding: '4px',
    }}
  >
    Ω
  </span>
);

export const Default = Template.bind({});
Default.args = {
  id: 'input-default',
};

export const WithError = Template.bind({});
WithError.args = {
  hasError: true,
  id: 'input-has-error',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  id: 'input-disabled',
};

export const TypeDate = Template.bind({});
TypeDate.args = {
  type: 'date',
  id: 'input-date',
};

export const TypeDateTime = Template.bind({});
TypeDateTime.args = {
  type: 'datetime-local',
  id: 'input-datetime-local',
  min: '2022-09-05T11:29:17',
  max: '2023-09-05T10:29:49',
};

export const IconPrepend = Template.bind({});
IconPrepend.args = {
  prependIconName: 'search',
  id: 'input-icon-prepend',
};

export const IconAppend = Template.bind({});
IconAppend.args = {
  value: 'I type words and even more words',
  appendIconName: 'search',
  id: 'input-icon-append',
};

export const ElementPrepend = Template.bind({});
ElementPrepend.args = {
  value: '<- custom element',
  prependElement: customElementPlaceholder,
  id: 'input-element-prepend',
};

export const ElementAppend = Template.bind({});
ElementAppend.args = {
  value: 'custom element ->',
  appendElement: customElementPlaceholder,
  id: 'input-element-append',
};
