import type { Story, Meta } from '@storybook/react';
import {
  OrderType,
  OrderStatus,
  Side,
  OrderTimeInForce,
} from '@vegaprotocol/types';
import { OrderList } from './order-list';
import type { Orders_party_orders } from '../__generated__/Orders';

export default {
  component: OrderList,
  title: 'OrderList',
} as Meta;

const marketOrder: Orders_party_orders = {
  __typename: 'Order',
  id: 'order-id2',
  market: {
    __typename: 'Market',
    id: 'market-id',
    name: 'market-name',
    decimalPlaces: 2,
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        code: 'instrument-code',
      },
    },
  },
  size: '10',
  type: OrderType.Market,
  status: OrderStatus.Active,
  side: Side.Buy,
  remaining: '5',
  price: '',
  timeInForce: OrderTimeInForce.IOC,
  createdAt: new Date().toISOString(),
  updatedAt: null,
  expiresAt: null,
  rejectionReason: null,
};

const limitOrder: Orders_party_orders = {
  __typename: 'Order',
  id: 'order-id',
  market: {
    __typename: 'Market',
    id: 'market-id',
    name: 'market-name',
    decimalPlaces: 2,
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        code: 'instrument-code',
      },
    },
  },
  size: '10',
  type: OrderType.Limit,
  status: OrderStatus.Active,
  side: Side.Sell,
  remaining: '5',
  price: '12345',
  timeInForce: OrderTimeInForce.GTT,
  createdAt: new Date('2022-3-3').toISOString(),
  expiresAt: new Date('2022-3-5').toISOString(),
  updatedAt: null,
  rejectionReason: null,
};

const Template: Story = (args) => {
  return (
    <div style={{ width: 1000, height: 1000 }}>
      <OrderList data={args.data} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  data: [marketOrder, limitOrder],
};
