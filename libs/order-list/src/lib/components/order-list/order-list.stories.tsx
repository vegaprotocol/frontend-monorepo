import type { Story, Meta } from '@storybook/react';
import {
  OrderType,
  OrderStatus,
  Side,
  OrderTimeInForce,
} from '@vegaprotocol/types';
import { OrderList, OrderListTable } from './order-list';
import type { Orders_party_orders } from '../__generated__/Orders';
import { CancelDialog } from '../cancel-order-dialog';
import { useState } from 'react';
import type { VegaTxState, Order } from '@vegaprotocol/wallet';
import { VegaTxStatus } from '@vegaprotocol/wallet';

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
    positionDecimalPlaces: 2,
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
    positionDecimalPlaces: 2,
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
  const cancel = () => Promise.resolve();
  return (
    <div style={{ height: 1000 }}>
      <OrderListTable data={args.data} cancel={cancel} />
    </div>
  );
};

const Template2: Story = (args) => {
  const [open, setOpen] = useState(false);
  const cancel = () => {
    setOpen(!open);
    return Promise.resolve();
  };
  const transaction: VegaTxState = {
    status: VegaTxStatus.Default,
    error: null,
    txHash: null,
    signature: null,
  };
  const finalizedOrder: Order = {
    status: OrderStatus.Cancelled,
    rejectionReason: null,
    size: '10',
    price: '1000',
    market: null,
    type: OrderType.Limit,
  };
  const reset = () => null;
  return (
    <>
      <div style={{ height: 1000 }}>
        <OrderListTable data={args.data} cancel={cancel} />
      </div>
      <CancelDialog
        orderDialogOpen={open}
        setOrderDialogOpen={setOpen}
        finalizedOrder={finalizedOrder}
        transaction={transaction}
        reset={reset}
      />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  data: [marketOrder, limitOrder],
};

export const Modal = Template2.bind({});
Modal.args = {
  data: [marketOrder, limitOrder],
};
