import type { Story, Meta } from '@storybook/react';
import { Lozenge } from './lozenge';
import { Intent } from '../../utils/intent';

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

export const Primary = Template.bind({});
Primary.args = {
  variant: Intent.Primary,
};

export const Success = Template.bind({});
Success.args = {
  variant: Intent.Success,
};

export const Warning = Template.bind({});
Warning.args = {
  variant: Intent.Warning,
};

export const Danger = Template.bind({});
Danger.args = {
  variant: Intent.Danger,
};
