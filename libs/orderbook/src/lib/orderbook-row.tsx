import {
  PriceCell,
  Vol,
  CummulativeVol,
  formatNumber,
} from '@vegaprotocol/react-helpers';
import type { OrderbookData } from './orderbook-data';

interface OrderbookRowProps {
  data: OrderbookData;
  decimalPlaces: number;
}

const toPercentString = (value?: number) => `${Math.ceil((value ?? 0) * 100)}%`;

export const OrderbookRow = ({ data, decimalPlaces }: OrderbookRowProps) => {
  return (
    <>
      <div>
        <Vol
          value={data.bidVol}
          relativeValue={toPercentString(data.relativeBidVol)}
          type="bid"
        />
      </div>
      <div>
        <PriceCell
          value={data.price}
          valueFormatted={formatNumber(data.price, decimalPlaces)}
        />
      </div>
      <div>
        <Vol
          value={data.askVol}
          relativeValue={toPercentString(data.relativeAskVol)}
          type="ask"
        />
      </div>
      <div>
        <CummulativeVol
          relativeAsk={toPercentString(data.cummulativeVol.relativeAsk)}
          relativeBid={toPercentString(data.cummulativeVol.relativeBid)}
        />
      </div>
    </>
  );
};

export default OrderbookRow;
