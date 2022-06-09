import React from 'react';
import { theme } from '@vegaprotocol/tailwindcss-config';
import type { SimpleMarkets_markets_candles } from './__generated__/SimpleMarkets';

interface Props {
  candles: (SimpleMarkets_markets_candles | null)[] | null;
}

const getChange = (
  candles: (SimpleMarkets_markets_candles | null)[] | null
) => {
  if (candles) {
    const first = parseInt(candles.find((item) => item?.open)?.open || '-1');
    const last = candles.reduceRight((aggr, item) => {
      if (aggr === -1 && item?.close) {
        aggr = parseInt(item.close);
      }
      return aggr;
    }, -1);
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

const SimpleMarketPercentChange = ({ candles }: Props) => {
  const change = getChange(candles);
  const color = getColor(change);
  return <p style={{ color }}>{change}</p>;
};

export default SimpleMarketPercentChange;
