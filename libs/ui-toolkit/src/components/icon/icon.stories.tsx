import { Story, Meta } from '@storybook/react';
import { Icon } from './icon';

export default {
  component: Icon,
  title: 'Icon',
} as Meta;

const Template: Story = (args) => <Icon {...args} name="warning-sign" />;

export const Default = Template.bind({});
Default.args = {};
