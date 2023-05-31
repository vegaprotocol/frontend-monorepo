import React, { memo } from 'react';
import { addDecimal, addDecimalsFixedFormatNumber } from '@vegaprotocol/utils';
import { NumericCell, PriceCell, VolCell } from '@vegaprotocol/datagrid';
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
  indicativeVolume?: string;
  price: string;
  relativeAsk?: number;
  relativeBid?: number;
  onClick?: (price: string) => void;
  type: VolumeType;
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

const RelativityBar = ({
  type,
  relativeAsk,
  relativeBid,
}: Pick<OrderbookRowProps, 'type, relativeAsk, relativeBid'>) => {
  const askBar = relativeAsk ? (
    <div
      data-testid="ask-bar"
      className="absolute left-0 top-0 opacity-40 dark:opacity-100 bg-vega-pink/60 transition-all"
      style={{
        height: relativeBid && relativeAsk ? '50%' : '100%',
        width: `${relativeAsk}%`,
      }}
    />
  ) : null;
  const bidBar = relativeBid ? (
    <div
      data-testid="bid-bar"
      className="absolute top-0 left-0 bg-vega-green/60 transition-all"
      style={{
        height: relativeBid && relativeAsk ? '50%' : '100%',
        top: relativeBid && relativeAsk ? '50%' : '0',
        width: `${relativeBid}%`,
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
    indicativeVolume,
    testId,
    positionDecimalPlaces,
  }: {
    ask?: number;
    bid?: number;
    indicativeVolume?: string;
    testId?: string;
    className?: string;
    positionDecimalPlaces: number;
  }) => {
    const volume = indicativeVolume ? (
      <span>
        (
        <NumericCell
          value={Number(indicativeVolume)}
          valueFormatted={addDecimalsFixedFormatNumber(
            indicativeVolume,
            positionDecimalPlaces ?? 0
          )}
        />
        )
      </span>
    ) : (
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
    type,
  }: OrderbookRowProps) => {
    const value = bid || ask;
    return (
      <div className="relative w-full">
        <RelativityBar
          type={type}
          relativeAsk={cumulativeRelativeAsk}
          relativeBid={cumulativeRelativeBid}
        />
        <div className="grid gap-1 text-right auto-rows-[17px] grid-cols-3 w-full grid-rows-1">
          <PriceCell
            testId={`price-${price}`}
            value={BigInt(price)}
            onClick={() => onClick && onClick(addDecimal(price, decimalPlaces))}
            valueFormatted={addDecimalsFixedFormatNumber(price, decimalPlaces)}
          />
          <VolCell
            testId={`bid-ask-vol-${price}`}
            value={value}
            valueFormatted={addDecimalsFixedFormatNumber(
              value,
              positionDecimalPlaces
            )}
            type={type === VolumeType.ask ? 'ask' : 'bid'}
          />
          <CumulativeVol
            testId={`cumulative-vol-${price}`}
            positionDecimalPlaces={positionDecimalPlaces}
            bid={cumulativeBid}
            ask={cumulativeAsk}
            indicativeVolume={indicativeVolume}
          />
        </div>
      </div>
    );
  }
);
OrderbookContinuousRow.displayName = 'OrderbookContinuousRow';
