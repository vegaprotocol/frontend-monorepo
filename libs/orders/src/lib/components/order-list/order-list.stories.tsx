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
  const edit = () => Promise.resolve();
  return (
    <div style={{ height: 1000 }}>
      <OrderListTable data={args.data} cancel={cancel} edit={edit} />
    </div>
  );
};

const Template2: Story = (args) => {
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const cancel = () => {
    setOpen(!open);
    return Promise.resolve();
  };
  const edit = () => {
    setOpenEdit(!openEdit);
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
  const reset = () => {
    setOpen(false);
    setOpenEdit(false);
  };
  return (
    <>
      <div style={{ height: 1000 }}>
        <OrderListTable data={args.data} cancel={cancel} edit={edit} />
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

const Template3: Story = (args) => {
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const cancel = () => {
    setOpen(!open);
    return Promise.resolve();
  };
  const edit = () => {
    setOpenEdit(!openEdit);
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
  const reset = () => {
    setOpen(false);
    setOpenEdit(false);
  };
  return (
    <>
      <div style={{ height: 1000 }}>
        <OrderListTable data={args.data} cancel={cancel} edit={edit} />
      </div>
      <VegaTransactionDialog
        orderDialogOpen={openEdit}
        setOrderDialogOpen={setOpenEdit}
        finalizedOrder={finalizedOrder}
        newOrder={finalizedOrder}
        transaction={transaction}
        reset={reset}
        type={VegaOrderTransactionType.EDIT}
      />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  data: generateOrdersArray(),
};

export const CancelModal = Template2.bind({});
CancelModal.args = {
  data: generateOrdersArray(),
};

export const EditModal = Template3.bind({});
EditModal.args = {
  data: generateOrdersArray(),
};
