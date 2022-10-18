import type {
  MarketDataFieldsFragment,
  SingleMarketFieldsFragment,
} from '@vegaprotocol/market-list';
import type { Order } from '@vegaprotocol/orders';
import { addDecimalsFormatNumber, Size, t } from '@vegaprotocol/react-helpers';
import type { ReactNode } from 'react';
import type { ClosingOrder as IClosingOrder } from './use-close-position';
import { useRequestClosePositionData } from './use-request-close-position-data';

export const RequestedClosePosition = ({
  order,
  partyId,
}: {
  order?: IClosingOrder;
  partyId: string;
}) => {
  const { market, marketData, orders } = useRequestClosePositionData(
    order?.marketId,
    partyId
  );

  if (!market || !marketData || !orders) {
    return <div>{t('Loading...')}</div>;
  }

  if (!order) {
    return (
      <div className="text-vega-red">{t('Could not create closing order')}</div>
    );
  }

  return (
    <>
      <ClosingOrder order={order} market={market} marketData={marketData} />
      <ActiveOrders market={market} orders={orders} />
    </>
  );
};

const ClosingOrder = ({
  order,
  market,
  marketData,
}: {
  order: IClosingOrder;
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
  market,
  orders,
}: {
  market: SingleMarketFieldsFragment;
  orders: Order[];
}) => {
  const asset = market.tradableInstrument.instrument.product.settlementAsset;

  if (!orders.length) {
    return null;
  }

  return (
    <div className="mt-4">
      <h2 className="font-bold">{t('Orders to be closed')}</h2>
      <BasicTable
        headers={[t('Amount'), t('Target price'), t('Time in force')]}
        rows={orders.map((o) => {
          return [
            <Size
              value={o.size}
              side={o.side}
              positionDecimalPlaces={market.positionDecimalPlaces}
            />,
            `${addDecimalsFormatNumber(o.price, market.decimalPlaces)} ${
              asset.symbol
            }`,
            o.timeInForce,
          ];
        })}
      />
    </div>
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
            {cells.map((c, i) => (
              <td key={i} className="w-1/3 align-top">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
