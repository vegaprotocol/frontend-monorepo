import type { Story, Meta } from '@storybook/react';
import { OrderListManager } from './order-list-manager';

export default {
  component: OrderListManager,
  title: 'OrderListManager',
} as Meta;

const Template: Story = (args) => {
  return (
    <div style={{ width: 1000, height: 1000 }}>
      <OrderListManager partyId={'0x000'} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};
