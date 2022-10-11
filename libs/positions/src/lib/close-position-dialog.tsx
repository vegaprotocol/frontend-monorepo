import { marketProvider } from '@vegaprotocol/market-list';
import { isOrderActive, ordersWithMarketProvider } from '@vegaprotocol/orders';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import type { VegaTxState } from '@vegaprotocol/wallet';
import { VegaDialog } from '@vegaprotocol/wallet';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import { useMemo } from 'react';
import { ClosingOrder } from './use-close-position';

export const ClosePositionDialog = ({
  transaction,
  order,
  partyId,
}: {
  transaction: VegaTxState;
  order?: ClosingOrder;
  partyId: string;
}) => {
  return (
    <Dialog open={transaction.dialogOpen}>
      <ClosePositionContainer
        transaction={transaction}
        order={order}
        partyId={partyId}
      />
    </Dialog>
  );
};

const ClosePositionContainer = ({
  transaction,
  order,
  partyId,
}: {
  transaction: VegaTxState;
  order?: ClosingOrder;
  partyId: string;
}) => {
  // Show default tx UI unles requested state then show custom UI
  if (
    transaction.status === VegaTxStatus.Pending ||
    transaction.status === VegaTxStatus.Error ||
    transaction.status === VegaTxStatus.Complete
  ) {
    return <VegaDialog transaction={transaction} />;
  }

  if (!order) {
    return <div>Could not create closing order</div>;
  }

  return (
    <div>
      <h1 className="text-xl mb-4">Confirm transaction in your Vega wallet</h1>
      <ClosingOrder order={order} />
      <ActiveOrders marketId={order.marketId} partyId={partyId} />
    </div>
  );
};

const ClosingOrder = ({ order }: { order: ClosingOrder }) => {
  const marketVariables = useMemo(
    () => ({ marketId: order?.marketId }),
    [order]
  );
  const { data } = useDataProvider({
    dataProvider: marketProvider,
    variables: marketVariables,
    skip: !order?.marketId,
  });

  return (
    <div className="flex gap-4">
      {data && (
        <div>
          <div>Market</div>
          <div>{data.tradableInstrument.instrument.name}</div>
        </div>
      )}
      <div>
        <div>Type</div>
        <div>{order.type}</div>
      </div>
      <div>
        <div>Amount</div>
        <div>{order.size}</div>
      </div>
    </div>
  );
};

const ActiveOrders = ({
  partyId,
  marketId,
}: {
  partyId: string;
  marketId: string;
}) => {
  const { data, error, loading } = useDataProvider({
    dataProvider: ordersWithMarketProvider,
    variables: { partyId },
  });

  const ordersForPosition = useMemo(() => {
    if (!data) return [];
    return data.filter((o) => {
      // Filter out orders not on market for position
      if (!o.node.market || o.node.market.id !== marketId) {
        return false;
      }

      if (!isOrderActive(o.node.status)) {
        return false;
      }

      return true;
    });
  }, [data, marketId]);

  if (error) {
    return <div>Could not fetch order data: {error.message}</div>;
  }

  if (loading) {
    return null;
  }

  return (
    <ul>
      {ordersForPosition.map((o) => (
        <li key={o.node.id}>
          <p>Type: {o.node.type}</p>
          <p>Size: {o.node.size}</p>
          <p>Price: {o.node.price ? o.node.price : '-'}</p>
          <p>TIF: {o.node.timeInForce}</p>
          <p>Expiry: {o.node.expiresAt ? o.node.expiresAt : '-'}</p>
          <p>Expiry: {o.node.remaining}</p>
        </li>
      ))}
    </ul>
  );
};
