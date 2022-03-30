import type { Story, Meta } from '@storybook/react';
import { TextArea } from './text-area';

export default {
  component: TextArea,
  title: 'TextArea',
} as Meta;

const Template: Story = (args) => (
  <TextArea {...args} className="h-48">
    I type words
  </TextArea>
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
