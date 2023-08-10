import type { StoryFn, Meta } from '@storybook/react';
import { Input } from '../input';
import type { FormGroupProps } from './form-group';
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
    disabled: {
      type: 'boolean',
    },
  },
} as Meta;

const Template: StoryFn<FormGroupProps> = (args) => (
  <FormGroup {...args}>
    <Input id="labelFor" />
  </FormGroup>
);

export const Default = Template.bind({});
Default.args = {
  label: 'Label',
  labelFor: 'labelFor',
};

export const WithLabelDescription = Template.bind({});
WithLabelDescription.args = {
  label: 'Label',
  labelFor: 'labelFor',
  labelDescription: 'Description text',
};
