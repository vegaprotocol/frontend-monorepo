import { t } from '@vegaprotocol/react-helpers';
import { OrderbookRow } from './orderbook-row';
import type { OrderbookData } from './orderbook-data';

interface OrderbookProps {
  data: OrderbookData[] | null;
  decimalPlaces: number;
}

export const Orderbook = ({ data, decimalPlaces }: OrderbookProps) => (
  <div className="grid grid-cols-4 gap-4 text-right text-ui-small">
    <div>{t('Bid Vol')}</div>
    <div>{t('Price')}</div>
    <div>{t('Ask Vol')}</div>
    <div>{t('Cumulative Vol')}</div>
    {data?.map((data) => (
      <OrderbookRow
        key={data.price}
        price={data.price}
        decimalPlaces={decimalPlaces}
        bidVol={data.bidVol}
        relativeBidVol={data.relativeBidVol}
        cummulativeRelativeBidVol={data.cummulativeVol.relativeBid}
        askVol={data.askVol}
        relativeAskVol={data.relativeAskVol}
        cummulativeRelativeAskVol={data.cummulativeVol.relativeAsk}
      />
    ))}
  </div>
);

export default Orderbook;
