import React, { memo } from 'react';
import { addDecimal, addDecimalsFixedFormatNumber } from '@vegaprotocol/utils';
import { NumericCell, PriceCell } from '@vegaprotocol/datagrid';
import { VolumeType } from './orderbook-data';
import classNames from 'classnames';

interface OrderbookRowProps {
  value: number;
  cumulativeValue?: number;
  cumulativeRelativeValue?: number;
  decimalPlaces: number;
  positionDecimalPlaces: number;
  price: string;
  onClick?: (price: string) => void;
  type: VolumeType;
}

const CumulationBar = ({
  cumulativeValue = 0,
  type,
}: {
  cumulativeValue?: number;
  type: VolumeType;
}) => {
  return (
    <div
      data-testid={`${VolumeType.bid === type ? 'bid' : 'ask'}-bar`}
      className={classNames(
        'absolute top-0 left-0 h-full transition-all',
        type === VolumeType.bid
          ? 'bg-market-green/20 dark:bg-market-green/50'
          : 'bg-market-red/20 dark:bg-market-red/30'
      )}
      style={{
        width: `${cumulativeValue}%`,
      }}
    />
  );
};

const CumulativeVol = memo(
  ({
    testId,
    positionDecimalPlaces,
    cumulativeValue,
  }: {
    ask?: number;
    bid?: number;
    cumulativeValue?: number;
    testId?: string;
    className?: string;
    positionDecimalPlaces: number;
  }) => {
    const volume = cumulativeValue ? (
      <NumericCell
        value={cumulativeValue}
        valueFormatted={addDecimalsFixedFormatNumber(
          cumulativeValue,
          positionDecimalPlaces ?? 0
        )}
      />
    ) : null;

    return (
      <div className="pr-1" data-testid={testId}>
        {volume}
      </div>
    );
  }
);
CumulativeVol.displayName = 'OrderBookCumulativeVol';

export const OrderbookRow = React.memo(
  ({
    value,
    cumulativeValue,
    cumulativeRelativeValue,
    decimalPlaces,
    positionDecimalPlaces,
    price,
    onClick,
    type,
  }: OrderbookRowProps) => {
    const txtId = type === VolumeType.bid ? 'bid' : 'ask';
    return (
      <div className="relative">
        <CumulationBar cumulativeValue={cumulativeRelativeValue} type={type} />
        <div className="grid gap-1 text-right grid-cols-3">
          <PriceCell
            testId={`price-${price}`}
            value={BigInt(price)}
            onClick={() => onClick && onClick(addDecimal(price, decimalPlaces))}
            valueFormatted={addDecimalsFixedFormatNumber(price, decimalPlaces)}
            className={
              type === VolumeType.ask
                ? 'text-market-red dark:text-market-red'
                : 'text-market-green-600 dark:text-market-green'
            }
          />
          <NumericCell
            testId={`${txtId}-vol-${price}`}
            value={value}
            valueFormatted={addDecimalsFixedFormatNumber(
              value,
              positionDecimalPlaces
            )}
          />
          <CumulativeVol
            testId={`cumulative-vol-${price}`}
            positionDecimalPlaces={positionDecimalPlaces}
            cumulativeValue={cumulativeValue}
          />
        </div>
      </div>
    );
  }
);
OrderbookRow.displayName = 'OrderbookRow';
