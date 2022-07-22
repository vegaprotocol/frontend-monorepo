import type { Story, Meta } from '@storybook/react';
import { OrderList, OrderListTable } from './order-list';
import { useState } from 'react';
import type { VegaTxState } from '@vegaprotocol/wallet';
import { VegaTransactionDialog, VegaTxStatus } from '@vegaprotocol/wallet';
import { generateOrdersArray } from '../mocks';
import { OrderEditDialog } from './order-edit-dialog';
import type { OrderFields } from '../order-data-provider';

export default {
  component: OrderList,
  title: 'OrderList',
} as Meta;

const Template: Story = (args) => {
  const cancel = () => Promise.resolve();
  return (
    <div style={{ height: 1000 }}>
      <OrderListTable
        rowData={args.data}
        cancel={cancel}
        setEditOrder={() => {
          return;
        }}
      />
    </div>
  );
};

const Template2: Story = (args) => {
  const [open, setOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<OrderFields | null>(false);
  const cancel = () => {
    setOpen(!open);
    return Promise.resolve();
  };
  const transaction: VegaTxState = {
    status: VegaTxStatus.Requested,
    error: null,
    txHash: null,
    signature: null,
  };
  return (
    <>
      <div style={{ height: 1000 }}>
        <OrderListTable
          rowData={args.data}
          cancel={cancel}
          setEditOrder={(order) => {
            setEditOrder(order);
          }}
        />
      </div>
      <VegaTransactionDialog
        isOpen={open}
        onChange={setOpen}
        transaction={transaction}
      />
      <OrderEditDialog
        isOpen={Boolean(editOrder)}
        onChange={(isOpen) => {
          if (!isOpen) setEditOrder(null);
        }}
        order={editOrder}
        onSubmit={(fields) => {
          return;
        }}
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
