import { Fragment } from 'react';
import { formatNumber, t } from '@vegaprotocol/react-helpers';
import { OrderbookRow } from './orderbook-row';
import type { OrderbookData } from './orderbook-data';

interface OrderbookProps {
  data: OrderbookData[] | null;
  midPrice?: string;
  decimalPlaces: number;
  resolution: number;
  onResolutionChange: (resolution: number) => void;
}

const horizontalLine = () => <div className="col-span-full border-b-1"></div>;

export const Orderbook = ({
  data,
  midPrice,
  decimalPlaces,
  resolution,
  onResolutionChange,
}: OrderbookProps) => (
  <>
    <div className="sticky top-0 grid grid-cols-4 gap-4 border-b-1 text-ui-small mb-2 pb-2 bg-white dark:bg-black z-10">
      <div>{t('Bid Vol')}</div>
      <div>{t('Price')}</div>
      <div>{t('Ask Vol')}</div>
      <div>{t('Cumulative Vol')}</div>
    </div>
    <div className="grid grid-cols-4 gap-4 text-right text-ui-small">
      {data?.map((data) => (
        <Fragment key={data.price}>
          {data.price === midPrice ? horizontalLine() : null}
          <OrderbookRow
            price={(BigInt(data.price) / BigInt(resolution)).toString()}
            decimalPlaces={decimalPlaces - Math.log10(resolution)}
            bid={data.bid}
            relativeBid={data.relativeBid}
            cumulativeRelativeBid={data.cumulativeVol.relativeBid}
            ask={data.ask}
            relativeAsk={data.relativeAsk}
            cumulativeRelativeAsk={data.cumulativeVol.relativeAsk}
          />
          {data.price === midPrice ? horizontalLine() : null}
        </Fragment>
      ))}
    </div>
    <div className="sticky bottom-0 grid grid-cols-4 gap-4 border-t-1 text-ui-small mt-2 pb-2 bg-white dark:bg-black z-10">
      <div className="text-ui-small col-start-2">
        <select
          onChange={(e) => onResolutionChange(Number(e.target.value))}
          value={resolution}
          className="bg-black-25 dark:bg-white-25 text-black dark:text-white focus-visible:shadow-focus dark:focus-visible:shadow-focus-dark focus-visible:outline-0 font-mono w-100 text-right w-full appearance-none"
        >
          {new Array(3)
            .fill(null)
            .map((v, i) => Math.pow(10, i))
            .map((r) => (
              <option key={r} value={r}>
                {formatNumber(0, decimalPlaces - Math.log10(r))}
              </option>
            ))}
        </select>
      </div>
    </div>
  </>
);

export default Orderbook;
