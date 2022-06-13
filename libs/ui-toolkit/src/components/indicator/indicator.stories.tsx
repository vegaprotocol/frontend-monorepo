import type { Story, Meta } from '@storybook/react';
import { Indicator } from './indicator';
import { Intent } from '../../utils/intent';

export default {
  component: Indicator,
  title: 'Indicator',
} as Meta;

const Template: Story = (args) => <Indicator {...args} />;

export const Default = Template.bind({});

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
