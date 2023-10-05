import type { Story, Meta } from '@storybook/react';
import { OrderListTable } from './order-list';
import { useState } from 'react';
import { generateOrdersArray } from '../mocks';
import { OrderEditDialog } from './order-edit-dialog';
import type { Order } from '../order-data-provider';

export default {
  component: OrderListTable,
  title: 'OrderListTable',
} as Meta;

const Template: Story = (args) => {
  const cancel = () => Promise.resolve();
  return (
    <div style={{ height: 1000 }}>
      <OrderListTable
        rowData={args.data}
        onCancel={cancel}
        onEdit={() => {
          return;
        }}
        onView={() => {
          return;
        }}
        isReadOnly={false}
      />
    </div>
  );
};

const Template2: Story = (args) => {
  const [editOrder, setEditOrder] = useState<Order>();
  return (
    <>
      <div style={{ height: 1000 }}>
        <OrderListTable
          rowData={args.data}
          onCancel={() => {
            return;
          }}
          onEdit={setEditOrder}
          onView={() => {
            return;
          }}
          isReadOnly={false}
        />
      </div>
      {editOrder && (
        <OrderEditDialog
          isOpen={Boolean(editOrder)}
          onChange={(isOpen) => {
            if (!isOpen) setEditOrder(undefined);
          }}
          order={editOrder}
          onSubmit={(fields) => {
            return;
          }}
        />
      )}
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
