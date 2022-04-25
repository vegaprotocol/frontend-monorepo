import React from 'react';
import {
  PriceCell,
  Vol,
  CumulativeVol,
  formatNumber,
} from '@vegaprotocol/react-helpers';

interface OrderbookRowProps {
  bid: number;
  relativeBidVol?: number;
  price: string;
  ask: number;
  relativeAskVol?: number;
  cumulativeRelativeAsk?: number;
  cumulativeRelativeBid?: number;
  decimalPlaces: number;
}

export const OrderbookRow = React.memo(
  ({
    bid,
    relativeBidVol,
    price,
    ask,
    relativeAskVol,
    decimalPlaces,
    cumulativeRelativeAsk,
    cumulativeRelativeBid,
  }: OrderbookRowProps) => {
    return (
      <>
        <Vol value={bid} relativeValue={relativeBidVol} type="bid" />
        <PriceCell
          value={BigInt(price)}
          valueFormatted={formatNumber(price, decimalPlaces)}
        />
        <Vol value={ask} relativeValue={relativeAskVol} type="ask" />
        <CumulativeVol
          relativeAsk={cumulativeRelativeAsk}
          relativeBid={cumulativeRelativeBid}
        />
      </>
    );
  }
);

OrderbookRow.displayName = 'OrderbookRow';

export default OrderbookRow;
