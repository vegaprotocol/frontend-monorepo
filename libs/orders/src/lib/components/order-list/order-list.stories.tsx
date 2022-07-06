import type { Story, Meta } from '@storybook/react';
import { OrderType, OrderStatus } from '@vegaprotocol/types';
import { OrderList, OrderListTable } from './order-list';
import { useState } from 'react';
import type { Order, VegaTxState } from '@vegaprotocol/wallet';
import { VegaOrderTransactionType } from '@vegaprotocol/wallet';
import { VegaTransactionDialog, VegaTxStatus } from '@vegaprotocol/wallet';
import { generateOrdersArray } from '../mocks';

export default {
  component: OrderList,
  title: 'OrderList',
} as Meta;

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
    market: { name: 'ETH/DAI (30 Jun 2022)', decimalPlaces: 5 },
    type: OrderType.Limit,
  };
  const reset = () => null;
  return (
    <>
      <div style={{ height: 1000 }}>
        <OrderListTable data={args.data} cancel={cancel} />
      </div>
      <VegaTransactionDialog
        orderDialogOpen={open}
        setOrderDialogOpen={setOpen}
        finalizedOrder={finalizedOrder}
        transaction={transaction}
        reset={reset}
        type={VegaOrderTransactionType.CANCEL}
      />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  data: generateOrdersArray(),
};

export const Modal = Template2.bind({});
Modal.args = {
  data: generateOrdersArray(),
};
