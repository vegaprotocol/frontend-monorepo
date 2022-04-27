import React from 'react';
import {
  PriceCell,
  Vol,
  CumulativeVol,
  formatNumber,
  VolumeType,
} from '@vegaprotocol/react-helpers';

interface OrderbookRowProps {
  bid: number;
  relativeBid?: number;
  price: string;
  ask: number;
  relativeAsk?: number;
  cumulativeRelativeAsk?: number;
  cumulativeRelativeBid?: number;
  decimalPlaces: number;
}

export const OrderbookRow = React.memo(
  ({
    bid,
    relativeBid,
    price,
    ask,
    relativeAsk,
    decimalPlaces,
    cumulativeRelativeAsk,
    cumulativeRelativeBid,
  }: OrderbookRowProps) => {
    return (
      <>
        <Vol value={bid} relativeValue={relativeBid} type={VolumeType.bid} />
        <PriceCell
          value={BigInt(price)}
          valueFormatted={formatNumber(price, decimalPlaces)}
        />
        <Vol value={ask} relativeValue={relativeAsk} type={VolumeType.ask} />
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
