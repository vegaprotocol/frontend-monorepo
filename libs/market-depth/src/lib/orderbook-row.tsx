import type { ReactNode } from 'react';
import { memo } from 'react';
import { addDecimal, addDecimalsFixedFormatNumber } from '@vegaprotocol/utils';
import { NumericCell } from '@vegaprotocol/datagrid';
import { VolumeType } from './orderbook-data';
import { cn } from '@vegaprotocol/ui-toolkit';

const HIDE_VOL_WIDTH = 190;
const HIDE_CUMULATIVE_VOL_WIDTH = 260;

interface OrderbookRowProps {
  volume: number;
  cumulativeVolume: number;
  decimalPlaces: number;
  positionDecimalPlaces: number;
  priceFormatDecimalPlaces: number;
  price: string;
  onClick: (args: { price?: string; size?: string }) => void;
  type: VolumeType;
  width: number;
  maxVol: number;
  crossed?: boolean;
}

export const OrderbookRow = memo(
  ({
    volume,
    cumulativeVolume,
    decimalPlaces,
    positionDecimalPlaces,
    priceFormatDecimalPlaces,
    price,
    onClick,
    type,
    width,
    maxVol,
    crossed,
  }: OrderbookRowProps) => {
    const txtId = type === VolumeType.bid ? 'bid' : 'ask';
    const cols =
      width >= HIDE_CUMULATIVE_VOL_WIDTH ? 3 : width >= HIDE_VOL_WIDTH ? 2 : 1;

    return (
      <div
        className={cn('relative px-1', {
          'bg-surface-1/30': crossed,
        })}
      >
        <CumulationBar
          cumulativeVolume={cumulativeVolume}
          type={type}
          maxVol={maxVol}
        />
        <div
          data-testid={`${txtId}-rows-container`}
          className={cn('grid gap-1 text-right relative', `grid-cols-${cols}`)}
        >
          <OrderBookRowCell
            onClick={() => onClick({ price: addDecimal(price, decimalPlaces) })}
          >
            <NumericCell
              testId={`price-${price}`}
              value={BigInt(price)}
              valueFormatted={addDecimalsFixedFormatNumber(
                price,
                decimalPlaces,
                priceFormatDecimalPlaces
              )}
              className={cn({
                'text-dir-down-fg': type === VolumeType.ask,
                'text-dir-up-fg': type === VolumeType.bid,
              })}
            />
          </OrderBookRowCell>
          {width >= HIDE_VOL_WIDTH && (
            <OrderBookRowCell
              onClick={() =>
                onClick({ size: addDecimal(volume, positionDecimalPlaces) })
              }
            >
              <NumericCell
                testId={`${txtId}-vol-${price}`}
                value={volume}
                valueFormatted={addDecimalsFixedFormatNumber(
                  volume,
                  positionDecimalPlaces ?? 0
                )}
              />
            </OrderBookRowCell>
          )}
          {width >= HIDE_CUMULATIVE_VOL_WIDTH && (
            <OrderBookRowCell
              onClick={() =>
                onClick({
                  size: addDecimal(cumulativeVolume, positionDecimalPlaces),
                })
              }
            >
              <NumericCell
                testId={`cumulative-vol-${price}`}
                value={cumulativeVolume}
                valueFormatted={addDecimalsFixedFormatNumber(
                  cumulativeVolume,
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
      className="overflow-hidden text-ellipsis whitespace-nowrap text-right hover:bg-gs-50/10"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const CumulationBar = ({
  cumulativeVolume = 0,
  type,
  maxVol,
}: {
  cumulativeVolume: number;
  type: VolumeType;
  maxVol: number;
}) => {
  const width = (cumulativeVolume / maxVol) * 100;
  return (
    <div
      data-testid={`${VolumeType.bid === type ? 'bid' : 'ask'}-bar`}
      className={cn(
        'absolute left-0 top-0 h-full',
        type === VolumeType.bid ? 'bg-dir-up/10' : 'bg-dir-down/10'
      )}
      style={{
        width: `${width}%`,
      }}
    />
  );
};
