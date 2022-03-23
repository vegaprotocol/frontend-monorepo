import { Story, Meta } from '@storybook/react';
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
    className: {
      type: 'string',
    },
  },
} as Meta;

const Template: Story = (args) => (
  <FormGroup {...args} label="label" labelFor="test">
    <Input id="labelFor" />
  </FormGroup>
);

export const Default = Template.bind({});
Default.args = {
  label: 'label',
  labelFor: 'labelFor',
};
