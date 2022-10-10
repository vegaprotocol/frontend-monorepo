import { marketProvider } from '@vegaprotocol/market-list';
import { isOrderActive, ordersWithMarketProvider } from '@vegaprotocol/orders';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import type { VegaTxState } from '@vegaprotocol/wallet';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useMemo } from 'react';
import type { Position } from './positions-data-providers';

export const ClosePositionDialog = ({
  position,
  transaction,
}: {
  position: Position | undefined;
  transaction: VegaTxState;
}) => {
  return (
    <Dialog open={transaction.dialogOpen}>
      {position && (
        <ClosePositionContainer position={position} transaction={transaction} />
      )}
    </Dialog>
  );
};

const ClosePositionContainer = ({
  position,
  transaction,
}: {
  position: Position;
  transaction: VegaTxState;
}) => {
  const { pubKey } = useVegaWallet();
  const variables = useMemo(() => ({ partyId: pubKey }), [pubKey]);
  const { data, error, loading } = useDataProvider({
    dataProvider: ordersWithMarketProvider,
    variables,
    skip: !pubKey,
  });
  const { data: marketData } = useDataProvider({
    dataProvider: marketProvider,
  });

  const ordersForPosition = useMemo(() => {
    if (!data) return [];
    return data.filter((o) => {
      // Filter out orders not on market for position
      if (!o.node.market || o.node.market.id !== position.marketId) {
        return false;
      }

      if (!isOrderActive(o.node.status)) {
        return false;
      }

      return true;
    });
  }, [data, position]);

  if (transaction.status === VegaTxStatus.Error) {
    return (
      <div>
        Tx error:{' '}
        {transaction.error ? transaction.error.message : 'Tx failed (unknown)'}
      </div>
    );
  }

  if (error) {
    return <div>Could not fetch order data</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>
        Close your position on {marketData?.tradableInstrument.instrument.name}
      </h1>
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
    </div>
  );
};
