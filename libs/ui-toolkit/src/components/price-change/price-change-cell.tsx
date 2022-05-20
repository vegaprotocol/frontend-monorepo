import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  PriceCell,
} from '@vegaprotocol/react-helpers';
import BigNumber from 'bignumber.js';

import { Arrow } from '../arrows/arrow';

export interface PriceChangeCellProps {
  /** either candle `close`or `open` values to be filtered and used here in order to calculate the price change  */
  candles: string[];
  decimalPlaces?: number;
}

export const priceChangePercentage = (candles: string[]) => {
  const change = priceChange(candles);
  if (change && candles && candles.length > 0) {
    const yesterdayLastPrice = candles[0] && BigInt(candles[0]);
    if (yesterdayLastPrice) {
      return new BigNumber(change.toString())
        .dividedBy(new BigNumber(yesterdayLastPrice.toString()))
        .multipliedBy(100)
        .toNumber();
    }
    return 0;
  }
  return 0;
};

export const priceChange = (candles: string[]) => {
  return candles &&
    candles[candles.length - 1] !== undefined &&
    candles[0] !== undefined
    ? BigInt(candles[candles.length - 1] ?? 0) - BigInt(candles[0] ?? 0)
    : 0;
};

const priceChangeClassNames = (value: number | bigint) =>
  value === 0
    ? 'text-black dark:text-white'
    : value > 0
    ? `text-green-dark dark:text-green-vega `
    : `text-red-dark dark:text-red-vega`;

export const PriceCellChange = ({
  candles,
  decimalPlaces,
}: PriceChangeCellProps) => {
  const change = priceChange(candles);
  const changePercentage = priceChangePercentage(candles);
  return (
    <span
      className={`${priceChangeClassNames(
        change
      )} flex items-center gap-4 justify-end`}
    >
      <Arrow value={change} />
      <span className="flex items-center gap-6">
        <span>
          {
            <PriceCell
              value={changePercentage}
              valueFormatted={formatNumberPercentage(
                new BigNumber(changePercentage.toString()),
                2
              )}
            />
          }
          &nbsp;
        </span>
        <span>
          (
          {
            <PriceCell
              value={BigInt(change)}
              valueFormatted={addDecimalsFormatNumber(
                change.toString(),
                decimalPlaces ?? 0,
                3
              )}
            />
          }
          )
        </span>
      </span>
    </span>
  );
};
