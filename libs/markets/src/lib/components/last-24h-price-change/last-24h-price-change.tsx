import type { RefObject } from 'react';
import { useInView } from 'react-intersection-observer';
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
  inViewRoot,
}: Props) => {
  const [ref, inView] = useInView({ root: inViewRoot?.current });
  const { oneDayCandles, error, fiveDaysCandles } = useCandles({
    marketId,
    inView,
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
        <span ref={ref}>-</span>
      </Tooltip>
    );
  }

  if (error || !isNumeric(decimalPlaces)) {
    return <span ref={ref}>-</span>;
  }
  return (
    <PriceChangeCell
      candles={oneDayCandles?.map((c) => c.close) || initialValue || []}
      decimalPlaces={decimalPlaces}
      ref={ref}
    />
  );
};
