import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { InView } from 'react-intersection-observer';
import { useSubscription } from '@apollo/client';
import type { SimpleMarkets_markets_candles } from './__generated__/SimpleMarkets';
import type {
  CandleLive,
  CandleLiveVariables,
} from './__generated__/CandleLive';
import { CANDLE_SUB } from './data-provider';

interface Props {
  candles: (SimpleMarkets_markets_candles | null)[] | null;
  marketId: string;
  setValue: (arg: unknown) => void;
}

const EMPTY_VALUE = ' - ';

const getChange = (
  candles: (SimpleMarkets_markets_candles | null)[] | null,
  lastClose?: string
) => {
  if (candles) {
    const first = parseInt(candles.find((item) => item?.open)?.open || '-1');
    const last =
      typeof lastClose === 'undefined'
        ? candles.reduceRight((aggr, item) => {
            if (aggr === -1 && item?.close) {
              aggr = parseInt(item.close);
            }
            return aggr;
          }, -1)
        : parseInt(lastClose);
    if (first !== -1 && last !== -1) {
      return Number(((last - first) / first) * 100).toFixed(3) + '%';
    }
  }
  return EMPTY_VALUE;
};

const getClassColor = (change: number | string) => {
  if (parseFloat(change as string) > 0) {
    return 'text-darkerGreen dark:text-lightGreen percent-change-up';
  }
  if (parseFloat(change as string) < 0) {
    return 'text-vega-pink percent-change-down';
  }
  if (change === EMPTY_VALUE) {
    return 'text-black-10';
  }
  return 'text-black-10 percent-change-unchanged';
};

const displayValue = (value: string) => {
  if (parseFloat(value) < 0) {
    return value.replace('-', '');
  }
  return value;
};

const SimpleMarketPercentChangeWrapper = (props: Props) => {
  const [inView, setInView] = useState(false);

  return (
    // @ts-ignore falsy wrong type?
    <InView
      onChange={setInView}
      className="flex h-full items-center justify-center"
    >
      {inView && <SimpleMarketPercentChange {...props} />}
    </InView>
  );
};

const SimpleMarketPercentChange = ({ candles, marketId, setValue }: Props) => {
  const { data: { candles: { close = undefined } = {} } = {} } =
    useSubscription<CandleLive, CandleLiveVariables>(CANDLE_SUB, {
      variables: { marketId },
    });
  const change = getChange(candles, close);
  const colorClasses = getClassColor(change);
  useEffect(() => {
    const value = parseFloat(change);
    setValue(isNaN(value) ? '-' : value);
  }, [setValue, change]);

  return (
    <div className={classNames('flex text-center before:block', colorClasses)}>
      {displayValue(change)}
    </div>
  );
};

export default SimpleMarketPercentChangeWrapper;
