import { t } from '@vegaprotocol/react-helpers';
import { OrderbookRow } from './orderbook-row';
import type { OrderbookData } from './orderbook-data';

interface OrderbookProps {
  data: OrderbookData[] | null;
  decimalPlaces: number;
}

export const Orderbook = ({ data, decimalPlaces }: OrderbookProps) => (
  <>
    <div className="grid grid-cols-4 gap-4 border-b-1 text-ui-small mb-2 pb-2">
      <div>{t('Bid Vol')}</div>
      <div>{t('Price')}</div>
      <div>{t('Ask Vol')}</div>
      <div>{t('Cumulative Vol')}</div>
    </div>
    <div className="grid grid-cols-4 gap-4 text-right text-ui-small">
      {data?.map((data) => (
        <OrderbookRow
          key={data.price}
          price={data.price}
          decimalPlaces={decimalPlaces}
          bid={data.bid}
          relativeBidVol={data.relativeBidVol}
          cumulativeRelativeBid={data.cumulativeVol.relativeBid}
          ask={data.ask}
          relativeAskVol={data.relativeAskVol}
          cumulativeRelativeAsk={data.cumulativeVol.relativeAsk}
        />
      ))}
    </div>
  </>
);

export default Orderbook;
