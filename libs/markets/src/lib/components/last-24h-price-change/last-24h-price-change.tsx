import type { RefObject } from 'react';
import { isNumeric } from '@vegaprotocol/utils';
import { PriceChangeCell } from '@vegaprotocol/datagrid';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useCandles } from '../../hooks/use-candles';

interface Props {
  marketId?: string;
  decimalPlaces?: number;
  initialValue?: string[];
  isHeader?: boolean;
  noUpdate?: boolean;
  inViewRoot?: RefObject<Element>;
}

export const Last24hPriceChange = ({
  marketId,
  decimalPlaces,
  initialValue,
}: Props) => {
  const { oneDayCandles, error, fiveDaysCandles } = useCandles({
    marketId,
  });
  if (
    fiveDaysCandles &&
    fiveDaysCandles.length > 0 &&
    (!oneDayCandles || oneDayCandles?.length === 0)
  ) {
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
  return (
    <PriceChangeCell
      candles={oneDayCandles?.map((c) => c.close) || initialValue || []}
      decimalPlaces={decimalPlaces}
    />
  );
};
