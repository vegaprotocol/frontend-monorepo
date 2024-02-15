import { type ReactNode } from 'react';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  getDateTimeFormat,
  priceChange,
  priceChangePercentage,
} from '@vegaprotocol/utils';
import { PriceChangeCell, signedNumberCssClass } from '@vegaprotocol/datagrid';
import { Tooltip, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { useCandles } from '../../hooks/use-candles';
import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import { useT } from '../../use-t';

interface Props {
  marketId?: string;
  decimalPlaces: number;
  fallback?: ReactNode;
}

export const Last24hPriceChange = ({
  marketId,
  decimalPlaces,
  fallback,
}: Props) => {
  const t = useT();
  const { oneDayCandles, fiveDaysCandles, error } = useCandles({
    marketId,
  });

  const nonIdeal = fallback || <span>{'-'}</span>;

  if (error || !oneDayCandles || !fiveDaysCandles) {
    return nonIdeal;
  }

  if (fiveDaysCandles.length < 24) {
    return (
      <Tooltip
        description={
          <span className="justify-start">
            {t(
              'Market has not been active for 24 hours. The price change between {{start}} and {{end}} is:',
              {
                start: getDateTimeFormat().format(
                  new Date(fiveDaysCandles[0].periodStart)
                ),
                end: getDateTimeFormat().format(
                  new Date(
                    fiveDaysCandles[fiveDaysCandles.length - 1].periodStart
                  )
                ),
              }
            )}
            <PriceChangeCell
              candles={fiveDaysCandles.map((c) => c.close) || []}
              decimalPlaces={decimalPlaces}
            />
          </span>
        }
      >
        <span>{nonIdeal}</span>
      </Tooltip>
    );
  }

  if (oneDayCandles.length < 24) {
    return (
      <Tooltip
        description={
          <span className="justify-start">
            {t(
              '24 hour change is unavailable at this time. The price change in the last 120 hours is:'
            )}{' '}
            <PriceChangeCell
              candles={fiveDaysCandles.map((c) => c.close) || []}
              decimalPlaces={decimalPlaces}
            />
          </span>
        }
      >
        <span>{nonIdeal}</span>
      </Tooltip>
    );
  }

  const candles = oneDayCandles?.map((c) => c.close) || [];
  const change = priceChange(candles);
  const changePercentage = priceChangePercentage(candles);

  return (
    <span
      className={classNames(
        'flex items-center gap-1',
        signedNumberCssClass(change)
      )}
    >
      <Arrow value={change} />
      <span data-testid="price-change-percentage">
        {formatNumberPercentage(new BigNumber(changePercentage.toString()), 2)}
      </span>
      <span data-testid="price-change">
        {addDecimalsFormatNumber(change.toString(), decimalPlaces ?? 0, 3)}
      </span>
    </span>
  );
};

const Arrow = ({ value }: { value: number | bigint }) => {
  const size = 10;

  if (value > 0) {
    return <VegaIcon name={VegaIconNames.ARROW_UP} size={size} />;
  }

  if (value < 0) {
    return <VegaIcon name={VegaIconNames.ARROW_DOWN} size={size} />;
  }

  return null;
};
