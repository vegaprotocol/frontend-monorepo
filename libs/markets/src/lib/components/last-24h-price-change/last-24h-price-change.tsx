import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  isNumeric,
  priceChange,
  priceChangePercentage,
} from '@vegaprotocol/utils';
import { PriceChangeCell, signedNumberCssClass } from '@vegaprotocol/datagrid';
import { Tooltip, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { useCandles } from '../../hooks/use-candles';
import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import { useT } from '../../use-t';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';

interface Props {
  marketId?: string;
  decimalPlaces?: number;
  initialValue?: string[];
  isHeader?: boolean;
  noUpdate?: boolean;
}

export const Last24hPriceChange = ({
  marketId,
  decimalPlaces,
  initialValue,
}: Props) => {
  const t = useT();
  const { isMobile } = useScreenDimensions();
  const { oneDayCandles, error, fiveDaysCandles } = useCandles({
    marketId,
  });
  if (
    fiveDaysCandles &&
    fiveDaysCandles.length > 0 &&
    (!oneDayCandles || oneDayCandles?.length === 0)
  ) {
    // if there is no change and no percentage, we don't show anything on mobile
    if (isMobile) {
      return null;
    }
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
        <span>-</span>
      </Tooltip>
    );
  }

  if (error || !isNumeric(decimalPlaces)) {
    return <span>-</span>;
  }

  const candles = oneDayCandles?.map((c) => c.close) || initialValue || [];
  const change = priceChange(candles);
  const changePercentage = priceChangePercentage(candles);

  // if there is no change and no percentage, we don't show anything on mobile
  if (!change && !changePercentage && isMobile) {
    return null;
  }

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
