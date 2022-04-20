import React from 'react';
import {
  PriceCell,
  Vol,
  CummulativeVol,
  formatNumber,
} from '@vegaprotocol/react-helpers';

interface OrderbookRowProps {
  bidVol: number;
  relativeBidVol?: string;
  price: number;
  askVol: number;
  relativeAskVol?: string;
  cummulativeRelativeAskVol?: string;
  cummulativeRelativeBidVol?: string;
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
    cummulativeRelativeAskVol,
    cummulativeRelativeBidVol,
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
          <CummulativeVol
            relativeAsk={cummulativeRelativeAskVol}
            relativeBid={cummulativeRelativeBidVol}
          />
        </div>
      </>
    );
  }
);

OrderbookRow.displayName = 'OrderbookRow';

export default OrderbookRow;
