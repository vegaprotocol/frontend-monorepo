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
  onClick: (price?: string | number) => void;
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
    onClick,
  }: OrderbookRowProps) => {
    return (
      <>
        <Vol
          testId={`bid-vol-${price}`}
          value={bid}
          valueFormatted={addDecimal(bid, positionDecimalPlaces)}
          relativeValue={relativeBid}
          type={VolumeType.bid}
        />
        <Vol
          testId={`ask-vol-${price}`}
          value={ask}
          valueFormatted={addDecimal(ask, positionDecimalPlaces)}
          relativeValue={relativeAsk}
          type={VolumeType.ask}
        />
        <PriceCell
          testId={`price-${price}`}
          value={BigInt(price)}
          onClick={() => onClick(price)}
          valueFormatted={addDecimalsFormatNumber(price, decimalPlaces)}
        />
        <CumulativeVol
          testId={`cumulative-vol-${price}`}
          positionDecimalPlaces={positionDecimalPlaces}
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
