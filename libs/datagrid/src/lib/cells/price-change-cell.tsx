import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  priceChange,
  priceChangePercentage,
} from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import { memo, forwardRef } from 'react';
import { Arrow } from '@vegaprotocol/ui-toolkit';
import { signedNumberCssClass } from '../cell-class-rules';

export interface PriceChangeCellProps {
  /** either candle `close`or `open` values to be filtered and used here in order to calculate the price change  */
  candles: string[];
  decimalPlaces?: number;
}

export const PriceChangeCell = memo(
  forwardRef<HTMLSpanElement, PriceChangeCellProps>(
    ({ candles, decimalPlaces }: PriceChangeCellProps, ref) => {
      const validCandles = candles.filter((c) => c !== '');
      const change = priceChange(validCandles);
      const changePercentage = priceChangePercentage(validCandles);
      return (
        <span
          ref={ref}
          className={`${signedNumberCssClass(
            change
          )} flex items-center gap-2 font-mono text-ui-small`}
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

PriceChangeCell.displayName = 'PriceChangeCell';
