import { Story, Meta } from '@storybook/react';
import { Orderbook } from './orderbook';

export default {
  component: Orderbook,
  title: 'Orderbook',
} as Meta;

const Template: Story = (args) => <Orderbook {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
