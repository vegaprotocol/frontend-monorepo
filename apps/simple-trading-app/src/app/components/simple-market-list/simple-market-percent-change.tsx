import React, { useState } from 'react';
import { InView } from 'react-intersection-observer';
import { useSubscription } from '@apollo/client';
import { theme } from '@vegaprotocol/tailwindcss-config';
import type { SimpleMarkets_markets_candles } from './__generated__/SimpleMarkets';
import type {
  CandleLive,
  CandleLiveVariables,
} from './__generated__/CandleLive';
import { CANDLE_SUB } from './data-provider';

interface Props {
  candles: (SimpleMarkets_markets_candles | null)[] | null;
  marketId: string;
}

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
  return ' - ';
};

const getColor = (change: number | string) => {
  if (parseFloat(change as string) > 0) {
    return theme.colors.vega.green;
  }
  if (parseFloat(change as string) < 0) {
    return theme.colors.vega.pink;
  }
  return theme.colors.black[10];
};

const SimpleMarketPercentChangeWrapper = (props: Props) => {
  const [inView, setInView] = useState(false);

  return (
    // @ts-ignore falsy wrong type?
    <InView onChange={setInView}>
      {inView && <SimpleMarketPercentChange {...props} />}
    </InView>
  );
};

const SimpleMarketPercentChange = ({ candles, marketId }: Props) => {
  const { data: { candles: { close = undefined } = {} } = {} } =
    useSubscription<CandleLive, CandleLiveVariables>(CANDLE_SUB, {
      variables: { marketId },
    });
  const change = getChange(candles, close);
  const color = getColor(change);
  return <p style={{ color }}>{change}</p>;
};

export default SimpleMarketPercentChangeWrapper;
