import { type ReactNode } from 'react';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  priceChange,
  priceChangePercentage,
} from '@vegaprotocol/utils';
import { signedNumberCssClass } from '@vegaprotocol/datagrid';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { useCandles } from '../../hooks/use-candles';
import BigNumber from 'bignumber.js';
import { cn } from '@vegaprotocol/utils';

interface Props {
  marketId?: string;
  decimalPlaces: number;
  fallback?: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  showChangeValue?: boolean;
}

export const Last24hPriceChange = ({
  marketId,
  decimalPlaces,
  fallback,
  orientation = 'horizontal',
  showChangeValue = true,
}: Props) => {
  const { oneDayCandles, fiveDaysCandles, error } = useCandles({
    marketId,
  });

  const nonIdeal = fallback || <span>{'-'}</span>;

  if (error || !oneDayCandles || !fiveDaysCandles) {
    return nonIdeal;
  }

  const candles =
    oneDayCandles.map((c) => c.close).filter((c) => c !== '') || [];
  const change = priceChange(candles);
  const changePercentage = priceChangePercentage(candles);

  if (orientation === 'vertical') {
    return (
      <span className={cn('leading-4', signedNumberCssClass(change))}>
        <div className="flex items-center gap-1 text-ellipsis whitespace-nowrap overflow-hidden">
          <Arrow value={change} />
          <span data-testid="price-change-percentage">
            {formatNumberPercentage(
              new BigNumber(changePercentage.toString()),
              2
            )}
          </span>
        </div>
        {showChangeValue && (
          <span
            data-testid="price-change"
            className="text-ellipsis whitespace-nowrap overflow-hidden text-muted text-xs"
          >
            ({addDecimalsFormatNumber(change.toString(), decimalPlaces ?? 0, 3)}
            )
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      className={cn('flex items-center gap-1', signedNumberCssClass(change))}
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
