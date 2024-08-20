import type { Story, Meta } from '@storybook/react';
import { Lozenge } from './lozenge';
import { Intent } from '../../utils/intent';

export default {
  component: Lozenge,
  title: 'Lozenge',
} as Meta;

const Template: Story = (args) => <Lozenge {...args}>lozenge</Lozenge>;

export const Default = Template.bind({});

export const None = Template.bind({});
None.args = {
  intent: Intent.None,
};

export const Primary = Template.bind({});
Primary.args = {
  intent: Intent.Primary,
};

export const Success = Template.bind({});
Success.args = {
  intent: Intent.Success,
};

export const Warning = Template.bind({});
Warning.args = {
  intent: Intent.Warning,
};

export const Danger = Template.bind({});
Danger.args = {
  intent: Intent.Danger,
};
