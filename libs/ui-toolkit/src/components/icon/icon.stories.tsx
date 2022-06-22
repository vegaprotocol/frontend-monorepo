import type { Story, Meta } from '@storybook/react';
import { Icon } from './icon';

export default {
  component: Icon,
  title: 'Icon',
} as Meta;

const Template: Story = (args) => <Icon name="warning-sign" {...args} />;

export const Default = Template.bind({});
Default.args = {};
