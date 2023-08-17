import type { Story, Meta } from '@storybook/react';
import { FormGroup } from '../form-group';
import { TextArea } from './text-area';

export default {
  component: TextArea,
  title: 'TextArea',
} as Meta;

const Template: Story = (args, context) => (
  <FormGroup labelClassName="sr-only" label="Hello" labelFor={args.id}>
    <TextArea {...args} className="h-48" defaultValue="I type words" />
  </FormGroup>
);

export const Default = Template.bind({});
Default.args = {
  id: 'text-area-default',
};

export const WithError = Template.bind({});
WithError.args = {
  id: 'text-area-error',
  hasError: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  id: 'text-area-disabled',
  disabled: true,
};
