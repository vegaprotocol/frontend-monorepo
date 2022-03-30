import type { Story, Meta } from '@storybook/react';
import { Lozenge } from './lozenge';

export default {
  component: Lozenge,
  title: 'Lozenge',
} as Meta;

const Template: Story = (args) => <Lozenge {...args}>lozenge</Lozenge>;

export const Default = Template.bind({});

export const WithDetails = Template.bind({});
WithDetails.args = {
  details: 'details text',
};

export const Highlight = Template.bind({});
Highlight.args = {
  variant: 'highlight',
};

export const Success = Template.bind({});
Success.args = {
  variant: 'success',
};

export const Warning = Template.bind({});
Warning.args = {
  variant: 'warning',
};

export const Danger = Template.bind({});
Danger.args = {
  variant: 'danger',
};
