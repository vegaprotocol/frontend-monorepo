import type {
  MarketDataFieldsFragment,
  SingleMarketFieldsFragment,
} from '@vegaprotocol/market-list';
import { marketDataProvider, marketProvider } from '@vegaprotocol/market-list';
import { isOrderActive, ordersWithMarketProvider } from '@vegaprotocol/orders';
import {
  addDecimalsFormatNumber,
  Size,
  t,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import type { VegaTxState } from '@vegaprotocol/wallet';
import { VegaDialog } from '@vegaprotocol/wallet';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import type { ReactNode } from 'react';
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
  const marketVariables = useMemo(
    () => ({ marketId: order?.marketId }),
    [order]
  );
  const { data: market } = useDataProvider({
    dataProvider: marketProvider,
    variables: marketVariables,
    skip: !order?.marketId,
  });
  const { data: marketData } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: marketVariables,
  });

  const showDefaultUI =
    transaction.status === VegaTxStatus.Pending ||
    transaction.status === VegaTxStatus.Error ||
    transaction.status === VegaTxStatus.Complete;

  if (!market || !marketData) {
    return <div>{t('Loading market data')}</div>;
  }

  if (!order) {
    return (
      <div className="text-vega-red">{t('Could not create closing order')}</div>
    );
  }

  return (
    <div>
      <h1 className="text-xl mb-4">
        {t('Confirm transaction in your Vega wallet')}
      </h1>
      {showDefaultUI ? (
        <VegaDialog transaction={transaction} />
      ) : (
        <>
          <div className="mb-4">
            <ClosingOrder
              order={order}
              market={market}
              marketData={marketData}
            />
          </div>
          <ActiveOrders market={market} partyId={partyId} />
        </>
      )}
    </div>
  );
};

const ClosingOrder = ({
  order,
  market,
  marketData,
}: {
  order: ClosingOrder;
  market: SingleMarketFieldsFragment;
  marketData: MarketDataFieldsFragment;
}) => {
  const asset = market.tradableInstrument.instrument.product.settlementAsset;
  const estimatedPrice =
    marketData && market
      ? addDecimalsFormatNumber(marketData.markPrice, market.decimalPlaces)
      : '-';
  const size = market ? (
    <Size
      value={order.size}
      side={order.side}
      positionDecimalPlaces={market.positionDecimalPlaces}
    />
  ) : (
    '-'
  );

  return (
    <>
      <h2 className="font-bold">{t('Position to be closed')}</h2>
      <BasicTable
        headers={[t('Market'), t('Amount'), t('Est price')]}
        rows={[
          [
            market.tradableInstrument.instrument.name,
            size,
            `~${estimatedPrice} ${asset?.symbol}`,
          ],
        ]}
      />
    </>
  );
};

const ActiveOrders = ({
  partyId,
  market,
}: {
  partyId: string;
  market: SingleMarketFieldsFragment;
}) => {
  const asset = market.tradableInstrument.instrument.product.settlementAsset;
  const { data, error, loading } = useDataProvider({
    dataProvider: ordersWithMarketProvider,
    variables: { partyId },
  });

  const ordersForPosition = useMemo(() => {
    if (!data) return [];
    return data.filter((o) => {
      // Filter out orders not on market for position
      if (!o.node.market || o.node.market.id !== market.id) {
        return false;
      }

      if (!isOrderActive(o.node.status)) {
        return false;
      }

      return true;
    });
  }, [data, market.id]);

  if (error) {
    return <div>{t(`Could not fetch order data: ${error.message}`)}</div>;
  }

  if (loading) {
    return null;
  }

  return (
    <>
      <h2 className="font-bold">{t('Orders to be closed')}</h2>
      <BasicTable
        headers={[t('Time in force'), t('Amount'), t('Target price')]}
        rows={ordersForPosition.map((o) => {
          return [
            o.node.timeInForce,
            <Size
              value={o.node.size}
              side={o.node.side}
              positionDecimalPlaces={market.positionDecimalPlaces}
            />,
            `${addDecimalsFormatNumber(o.node.price, market.decimalPlaces)} ${
              asset.symbol
            }`,
          ];
        })}
      />
    </>
  );
};

interface BasicTableProps {
  headers: ReactNode[];
  rows: ReactNode[][];
}

const BasicTable = ({ headers, rows }: BasicTableProps) => {
  return (
    <table className="w-full">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="text-left font-medium w-1/3">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((cells, i) => (
          <tr key={i}>
            {cells.map((c) => (
              <td className="w-1/3">{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
