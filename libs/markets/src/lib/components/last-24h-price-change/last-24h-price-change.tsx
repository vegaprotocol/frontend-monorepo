import type { RefObject } from 'react';
import { useInView } from 'react-intersection-observer';
import { isNumeric } from '@vegaprotocol/utils';
import { useFiveDaysAgo, useYesterday } from '@vegaprotocol/react-helpers';
import { useThrottledDataProvider } from '@vegaprotocol/data-provider';
import { PriceChangeCell } from '@vegaprotocol/datagrid';
import * as Schema from '@vegaprotocol/types';
import type { CandleClose } from '@vegaprotocol/types';
import { marketCandlesProvider } from '../../market-candles-provider';
import type { MarketCandlesFieldsFragment } from '../../__generated__/market-candles';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';

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
  const fiveDaysAgo = useFiveDaysAgo();
  const yesterday = useYesterday();
  const { data, error } = useThrottledDataProvider({
    dataProvider: marketCandlesProvider,
    variables: {
      marketId: marketId || '',
      interval: Schema.Interval.INTERVAL_I1H,
      since: new Date(fiveDaysAgo).toISOString(),
    },
    skip: !marketId || !inView,
  });

  const fiveDaysCandles = data?.filter((candle) => Boolean(candle));

  const candles = fiveDaysCandles?.filter((candle) =>
    isCandleLessThan24hOld(candle, yesterday)
  );
  const oneDayCandles =
    candles
      ?.map((candle) => candle?.close)
      .filter((c): c is CandleClose => c !== null) || initialValue;

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
        <span ref={ref}>{t('Unknown')} </span>
      </Tooltip>
    );
  }

  if (error || !isNumeric(decimalPlaces)) {
    return <span ref={ref}>-</span>;
  }
  return (
    <PriceChangeCell
      candles={oneDayCandles || []}
      decimalPlaces={decimalPlaces}
      ref={ref}
    />
  );
};

export const isCandleLessThan24hOld = (
  candle: MarketCandlesFieldsFragment | undefined,
  yesterday: number
) => {
  if (!candle?.periodStart) {
    return false;
  }
  const candleDate = new Date(candle.periodStart);
  return candleDate > new Date(yesterday);
};
