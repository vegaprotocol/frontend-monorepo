import React from 'react';
import { addDecimal, addDecimalsFixedFormatNumber } from '@vegaprotocol/utils';
import { PriceCell, VolCell, CumulativeVol } from '@vegaprotocol/datagrid';

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
  onClick?: (price: string) => void;
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
          valueFormatted={addDecimalsFixedFormatNumber(
            bid,
            positionDecimalPlaces
          )}
          relativeValue={relativeBid}
          type="bid"
        />
        <VolCell
          testId={`ask-vol-${price}`}
          value={ask}
          valueFormatted={addDecimalsFixedFormatNumber(
            ask,
            positionDecimalPlaces
          )}
          relativeValue={relativeAsk}
          type="ask"
        />
        <PriceCell
          testId={`price-${price}`}
          value={BigInt(price)}
          onClick={() => onClick && onClick(addDecimal(price, decimalPlaces))}
          valueFormatted={addDecimalsFixedFormatNumber(price, decimalPlaces)}
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

export const OrderbookContinuousRow = React.memo(
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
    const type = bid ? 'bid' : 'ask';
    const value = bid || ask;
    const relativeValue = bid ? relativeBid : relativeAsk;
    return (
      <>
        <VolCell
          testId={`bid-ask-vol-${price}`}
          value={value}
          valueFormatted={addDecimalsFixedFormatNumber(
            value,
            positionDecimalPlaces
          )}
          relativeValue={relativeValue}
          type={type}
        />
        <PriceCell
          testId={`price-${price}`}
          value={BigInt(price)}
          onClick={() => onClick && onClick(addDecimal(price, decimalPlaces))}
          valueFormatted={addDecimalsFixedFormatNumber(price, decimalPlaces)}
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
OrderbookContinuousRow.displayName = 'OrderbookContinuousRow';
