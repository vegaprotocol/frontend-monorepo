import React from 'react';
import {
  PriceCell,
  Vol,
  CumulativeVol,
  addDecimalsFormatNumber,
  VolumeType,
  addDecimal,
} from '@vegaprotocol/react-helpers';

interface OrderbookRowProps {
  ask: number;
  bid: number;
  cumulativeAsk?: number;
  cumulativeBid?: number;
  cumulativeRelativeAsk?: number;
  cumulativeRelativeBid?: number;
  decimalPlaces: number;
  positionDecimalPlaces: number;
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
    positionDecimalPlaces,
    indicativeVolume,
    price,
    relativeAsk,
    relativeBid,
  }: OrderbookRowProps) => {
    return (
      <>
        <Vol
          testId={`bid-vol-${price}`}
          value={bid}
          valueFormatted={addDecimal(bid, decimalPlaces)}
          relativeValue={relativeBid}
          type={VolumeType.bid}
        />
        <PriceCell
          testId={`price-${price}`}
          value={BigInt(price)}
          valueFormatted={addDecimalsFormatNumber(price, positionDecimalPlaces)}
        />
        <Vol
          testId={`ask-vol-${price}`}
          value={ask}
          valueFormatted={addDecimal(ask, decimalPlaces)}
          relativeValue={relativeAsk}
          type={VolumeType.ask}
        />
        <CumulativeVol
          testId={`cumulative-vol-${price}`}
          bid={cumulativeBid}
          ask={cumulativeAsk}
          relativeAsk={cumulativeRelativeAsk}
          relativeBid={cumulativeRelativeBid}
          indicativeVolume={indicativeVolume}
          className="pr-4 text-black dark:text-white"
        />
      </>
    );
  }
);

OrderbookRow.displayName = 'OrderbookRow';

export default OrderbookRow;
