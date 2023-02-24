import React from 'react';
import { addDecimal, addDecimalsFormatNumber } from '@vegaprotocol/utils';
import {
  PriceCell,
  VolCell,
  CumulativeVol,
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
  positionDecimalPlaces: number;
  indicativeVolume?: string;
  price: string;
  relativeAsk?: number;
  relativeBid?: number;
  onClick?: (price?: string | number) => void;
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
        <VolCell
          testId={`bid-vol-${price}`}
          value={bid}
          valueFormatted={addDecimalsFormatNumber(bid, positionDecimalPlaces)}
          relativeValue={relativeBid}
          type={VolumeType.bid}
        />
        <VolCell
          testId={`ask-vol-${price}`}
          value={ask}
          valueFormatted={addDecimalsFormatNumber(ask, positionDecimalPlaces)}
          relativeValue={relativeAsk}
          type={VolumeType.ask}
        />
        <PriceCell
          testId={`price-${price}`}
          value={BigInt(price)}
          onClick={() => onClick && onClick(price)}
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
        />
      </>
    );
  }
);

OrderbookRow.displayName = 'OrderbookRow';

export default OrderbookRow;
