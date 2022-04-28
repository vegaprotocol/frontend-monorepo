import React from 'react';
import {
  PriceCell,
  Vol,
  CumulativeVol,
  formatNumber,
  VolumeType,
} from '@vegaprotocol/react-helpers';

interface OrderbookRowProps {
  ask: number;
  bid: number;
  cumulativeAsk?: number;
  cumulativeBid?: number;
  cumulativeRelativeAsk?: number;
  cumulativeRelativeBid?: number;
  decimalPlaces: number;
  indicativeVolume?: string;
  price: string;
  relativeAsk?: number;
  relativeBid?: number;
}

export const OrderbookRow = React.memo(
  ({
    ask,
    bid,
    cumulativeAsk,
    cumulativeBid,
    cumulativeRelativeAsk,
    cumulativeRelativeBid,
    decimalPlaces,
    indicativeVolume,
    price,
    relativeAsk,
    relativeBid,
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
          bid={cumulativeBid}
          ask={cumulativeAsk}
          relativeAsk={cumulativeRelativeAsk}
          relativeBid={cumulativeRelativeBid}
          indicativeVolume={indicativeVolume}
        />
      </>
    );
  }
);

OrderbookRow.displayName = 'OrderbookRow';

export default OrderbookRow;
