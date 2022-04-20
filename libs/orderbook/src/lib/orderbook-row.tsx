import React from 'react';
import {
  PriceCell,
  Vol,
  CumulativeVol,
  formatNumber,
} from '@vegaprotocol/react-helpers';

interface OrderbookRowProps {
  bidVol: number;
  relativeBidVol?: number;
  price: number;
  askVol: number;
  relativeAskVol?: number;
  cumulativeRelativeAskVol?: number;
  cumulativeRelativeBidVol?: number;
  decimalPlaces: number;
}

export const OrderbookRow = React.memo(
  ({
    bidVol,
    relativeBidVol,
    price,
    askVol,
    relativeAskVol,
    decimalPlaces,
    cumulativeRelativeAskVol,
    cumulativeRelativeBidVol,
  }: OrderbookRowProps) => {
    return (
      <>
        <div>
          <Vol value={bidVol} relativeValue={relativeBidVol} type="bid" />
        </div>
        <div>
          <PriceCell
            value={price}
            valueFormatted={formatNumber(price, decimalPlaces)}
          />
        </div>
        <div>
          <Vol value={askVol} relativeValue={relativeAskVol} type="ask" />
        </div>
        <div>
          <CumulativeVol
            relativeAsk={cumulativeRelativeAskVol}
            relativeBid={cumulativeRelativeBidVol}
          />
        </div>
      </>
    );
  }
);

OrderbookRow.displayName = 'OrderbookRow';

export default OrderbookRow;
