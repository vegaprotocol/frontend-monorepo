import type { Story, Meta } from '@storybook/react';
import { Input } from '../input';
import { FormGroup } from './form-group';
export default {
  component: FormGroup,
  title: 'FormGroup',
  argTypes: {
    label: {
      type: 'string',
    },
    labelFor: {
      type: 'string',
    },
    labelDescription: {
      type: 'string',
    },
    className: {
      type: 'string',
    },
    hasError: {
      type: 'boolean',
    },
  },
} as Meta;

const Template: Story = (args) => (
  <FormGroup {...args}>
    <Input id="labelFor" />
  </FormGroup>
);

export const Default = Template.bind({});
Default.args = {
  label: 'Label',
  labelFor: 'labelFor',
};

export const Error = Template.bind({});
Error.args = {
  label: 'Label',
  labelFor: 'labelFor',
  hasError: true,
};

export const WithDescription = Template.bind({});
WithDescription.args = {
  label: 'Label',
  labelFor: 'labelFor',
  labelDescription: 'with description text',
};

export const WithDescriptionAndError = Template.bind({});
WithDescriptionAndError.args = {
  hasError: true,
  label: 'Label',
  labelFor: 'labelFor',
  labelDescription: 'with description text',
};
