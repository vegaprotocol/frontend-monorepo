import type { MarketData, Market } from '@vegaprotocol/market-list';
import type { Order } from '@vegaprotocol/orders';
import { timeInForceLabel } from '@vegaprotocol/orders';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { Size } from '@vegaprotocol/react-helpers';
import type { ReactNode } from 'react';
import type { ClosingOrder as IClosingOrder } from '../use-close-position';

export const ClosingOrder = ({
  order,
  market,
  marketData,
}: {
  order: IClosingOrder;
  market: Market;
  marketData: MarketData;
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
  );
};

export const ActiveOrders = ({
  market,
  orders,
}: {
  market: Market;
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
            timeInForceLabel(o.timeInForce),
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
            <th key={i} className="text-left font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((cells, i) => (
          <tr key={i}>
            {cells.map((c, i) => (
              <td key={i} className="align-top">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
