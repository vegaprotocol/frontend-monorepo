import React from 'react';
import type { SimpleMarkets_markets_candles } from './__generated__/SimpleMarkets';

type Props = {
  candles: (SimpleMarkets_markets_candles | null)[] | null;
};

const SimpleMarketPercentChange = ({ candles }: Props) => {
  const change = ((candles) => {
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
  })(candles);
  return <p>{change}</p>;
};

export default SimpleMarketPercentChange;
