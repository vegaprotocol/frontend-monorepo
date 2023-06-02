import React, { memo } from 'react';
import { addDecimal, addDecimalsFixedFormatNumber } from '@vegaprotocol/utils';
import { NumericCell, PriceCell } from '@vegaprotocol/datagrid';
import { VolumeType } from './orderbook-data';

interface OrderbookRowProps {
  ask: number;
  bid: number;
  cumulativeAsk?: number;
  cumulativeBid?: number;
  cumulativeRelativeAsk?: number;
  cumulativeRelativeBid?: number;
  decimalPlaces: number;
  positionDecimalPlaces: number;
  price: string;
  relativeAsk?: number;
  relativeBid?: number;
  onClick?: (price: string) => void;
  type: VolumeType;
}

const CumulationBar = ({
  cumulativeRelativeAsk,
  cumulativeRelativeBid,
}: Pick<
  OrderbookRowProps,
  'cumulativeRelativeAsk' | 'cumulativeRelativeBid'
>) => {
  const askBar = cumulativeRelativeAsk ? (
    <div
      data-testid="ask-bar"
      className="absolute left-0 top-0 bg-vega-pink/20 dark:bg-vega-pink/30 transition-all"
      style={{
        height: cumulativeRelativeBid && cumulativeRelativeAsk ? '50%' : '100%',
        width: `${cumulativeRelativeAsk}%`,
      }}
    />
  ) : null;
  const bidBar = cumulativeRelativeBid ? (
    <div
      data-testid="bid-bar"
      className="absolute top-0 left-0 bg-vega-green/20 dark:bg-vega-green/50 transition-all"
      style={{
        height: cumulativeRelativeBid && cumulativeRelativeAsk ? '50%' : '100%',
        top: cumulativeRelativeBid && cumulativeRelativeAsk ? '50%' : '0',
        width: `${cumulativeRelativeBid}%`,
      }}
    />
  ) : null;
  return (
    <>
      {askBar}
      {bidBar}
    </>
  );
};

const CumulativeVol = memo(
  ({
    ask,
    bid,
    testId,
    positionDecimalPlaces,
  }: {
    ask?: number;
    bid?: number;
    testId?: string;
    className?: string;
    positionDecimalPlaces: number;
  }) => {
    const volume = (
      <span>
        {ask ? (
          <NumericCell
            value={ask}
            valueFormatted={addDecimalsFixedFormatNumber(
              ask,
              positionDecimalPlaces ?? 0
            )}
          />
        ) : null}
        {ask && bid ? '/' : null}
        {bid ? (
          <NumericCell
            value={ask}
            valueFormatted={addDecimalsFixedFormatNumber(
              bid,
              positionDecimalPlaces ?? 0
            )}
          />
        ) : null}
      </span>
    );

    return (
      <div
        className="relative font-mono pr-1"
        data-testid={testId || 'cumulative-vol'}
      >
        {volume}
      </div>
    );
  }
);
CumulativeVol.displayName = 'OrderBookCumulativeVol';

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
    price,
    onClick,
    type,
  }: OrderbookRowProps) => {
    const value = bid || ask;
    return (
      <div className="relative w-full">
        <CumulationBar
          cumulativeRelativeAsk={cumulativeRelativeAsk}
          cumulativeRelativeBid={cumulativeRelativeBid}
        />
        <div className="grid gap-1 text-right auto-rows-[17px] grid-cols-3 w-full grid-rows-1">
          <PriceCell
            testId={`price-${price}`}
            value={BigInt(price)}
            onClick={() => onClick && onClick(addDecimal(price, decimalPlaces))}
            valueFormatted={addDecimalsFixedFormatNumber(price, decimalPlaces)}
            className={
              type === VolumeType.ask
                ? '!text-vega-pink dark:text-vega-pink'
                : 'text-vega-green-550 dark:text-vega-green'
            }
          />
          <NumericCell
            testId={`bid-ask-vol-${price}`}
            value={value}
            valueFormatted={addDecimalsFixedFormatNumber(
              value,
              positionDecimalPlaces
            )}
          />
          <CumulativeVol
            testId={`cumulative-vol-${price}`}
            positionDecimalPlaces={positionDecimalPlaces}
            bid={cumulativeBid}
            ask={cumulativeAsk}
          />
        </div>
      </div>
    );
  }
);
OrderbookRow.displayName = 'OrderbookRow';
