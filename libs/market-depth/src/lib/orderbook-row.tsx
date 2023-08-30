import type { ReactNode } from 'react';
import { memo } from 'react';
import { addDecimal, addDecimalsFixedFormatNumber } from '@vegaprotocol/utils';
import { NumericCell } from '@vegaprotocol/datagrid';
import { VolumeType } from './orderbook-data';
import classNames from 'classnames';

const HIDE_VOL_WIDTH = 190;
const HIDE_CUMULATIVE_VOL_WIDTH = 260;

interface OrderbookRowProps {
  value: number;
  cumulativeValue: number;
  cumulativeRelativeValue: number;
  decimalPlaces: number;
  positionDecimalPlaces: number;
  price: string;
  onClick: (args: { price?: string; size?: string }) => void;
  type: VolumeType;
  width: number;
}

export const OrderbookRow = memo(
  ({
    value,
    cumulativeValue,
    cumulativeRelativeValue,
    decimalPlaces,
    positionDecimalPlaces,
    price,
    onClick,
    type,
    width,
  }: OrderbookRowProps) => {
    const txtId = type === VolumeType.bid ? 'bid' : 'ask';
    const cols =
      width >= HIDE_CUMULATIVE_VOL_WIDTH ? 3 : width >= HIDE_VOL_WIDTH ? 2 : 1;
    return (
      <div className="relative px-1">
        <CumulationBar cumulativeValue={cumulativeRelativeValue} type={type} />
        <div
          data-testid={`${txtId}-rows-container`}
          className={classNames('grid gap-1 text-right', `grid-cols-${cols}`)}
        >
          <OrderBookRowCell
            onClick={() => onClick({ price: addDecimal(price, decimalPlaces) })}
          >
            <NumericCell
              testId={`price-${price}`}
              value={BigInt(price)}
              valueFormatted={addDecimalsFixedFormatNumber(
                price,
                decimalPlaces
              )}
              className={classNames({
                'text-market-red dark:text-market-red': type === VolumeType.ask,
                'text-market-green-600 dark:text-market-green':
                  type === VolumeType.bid,
              })}
            />
          </OrderBookRowCell>
          {width >= HIDE_VOL_WIDTH && (
            <OrderBookRowCell
              onClick={() =>
                onClick({ size: addDecimal(value, positionDecimalPlaces) })
              }
            >
              <NumericCell
                testId={`${txtId}-vol-${price}`}
                value={value}
                valueFormatted={addDecimalsFixedFormatNumber(
                  value,
                  positionDecimalPlaces ?? 0
                )}
              />
            </OrderBookRowCell>
          )}
          {width >= HIDE_CUMULATIVE_VOL_WIDTH && (
            <OrderBookRowCell
              onClick={() =>
                onClick({
                  size: addDecimal(cumulativeValue, positionDecimalPlaces),
                })
              }
            >
              <NumericCell
                testId={`cumulative-vol-${price}`}
                value={cumulativeValue}
                valueFormatted={addDecimalsFixedFormatNumber(
                  cumulativeValue,
                  positionDecimalPlaces
                )}
              />
            </OrderBookRowCell>
          )}
        </div>
      </div>
    );
  }
);

OrderbookRow.displayName = 'OrderbookRow';

const OrderBookRowCell = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => {
  return (
    <button
      className="overflow-hidden text-right text-ellipsis whitespace-nowrap hover:dark:bg-neutral-800 hover:bg-neutral-200"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

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
        'absolute top-0 left-0 h-full',
        type === VolumeType.bid
          ? 'bg-market-green-300 dark:bg-market-green/50'
          : 'bg-market-red-300 dark:bg-market-red/30'
      )}
      style={{
        width: `${cumulativeValue}%`,
      }}
    />
  );
};
