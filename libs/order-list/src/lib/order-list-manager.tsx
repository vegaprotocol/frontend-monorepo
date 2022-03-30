import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { OrderList } from './order-list';
import type { OrderFields } from './__generated__/OrderFields';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { ordersDataProvider, sortOrders } from './orders-data-provider';
import { useCallback, useMemo, useRef } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { OrderSub_orders } from './__generated__/OrderSub';
import isEqual from 'lodash/isEqual';

interface OrderListManagerProps {
  partyId: string;
}

export const OrderListManager = ({ partyId }: OrderListManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);

  // Apply updates to the table
  const update = useCallback((delta: OrderSub_orders[]) => {
    if (!gridRef.current) {
      return false;
    }

    const update: OrderFields[] = [];
    const add: OrderFields[] = [];

    delta.forEach((d) => {
      if (!gridRef.current) {
        return;
      }

      const rowNode = gridRef.current.api.getRowNode(d.id);

      if (rowNode) {
        if (!isEqual) {
          update.push(d);
        }
      } else {
        add.push(d);
      }
    });

    if (update.length || add.length) {
      gridRef.current.api.applyTransactionAsync({
        update,
        add,
        addIndex: 0,
      });
    }

    return true;
  }, []);

  const { data, error, loading } = useDataProvider(
    ordersDataProvider,
    update,
    variables
  );

  const orders = useMemo(() => {
    if (!data) {
      return null;
    }
    return sortOrders(data);
  }, [data]);

  return (
    <AsyncRenderer loading={loading} error={error} data={orders}>
      {(data) => <OrderList ref={gridRef} data={data} />}
    </AsyncRenderer>
  );
};
