import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/react-helpers';
import BigNumber from 'bignumber.js';
import { memo, forwardRef } from 'react';
import { signedNumberCssClass } from '@vegaprotocol/react-helpers';
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

export const PriceCellChange = memo(
  forwardRef<HTMLSpanElement, PriceChangeCellProps>(
    ({ candles, decimalPlaces }: PriceChangeCellProps, ref) => {
      const change = priceChange(candles);
      const changePercentage = priceChangePercentage(candles);
      return (
        <span
          ref={ref}
          className={`${signedNumberCssClass(
            change
          )} flex items-center gap-2 justify-end font-mono text-ui-small`}
        >
          <Arrow value={change} />
          <span data-testid="price-change-percentage">
            {formatNumberPercentage(
              new BigNumber(changePercentage.toString()),
              2
            )}
            &nbsp;
          </span>
          <span data-testid="price-change">
            {addDecimalsFormatNumber(change.toString(), decimalPlaces ?? 0, 3)}
          </span>
        </span>
      );
    }
  )
);

PriceCellChange.displayName = 'PriceCellChange';
