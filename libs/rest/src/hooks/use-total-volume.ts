import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCandleId,
  Interval,
  candleIntervalQueryOptions,
} from '../queries/candle-intervals';
import { candleDataQueryOptions } from '../queries/candle-data';
import { toNanoSeconds, yesterday } from '../utils';
import BigNumber from 'bignumber.js';
import { useMarkets } from './use-markets';

export function useTotalVolume() {
  const client = useQueryClient();
  const { data } = useMarkets();
  const markets = Array.from(data?.values() || []);

  const queryResult = useQuery({
    queryKey: ['totalVolume'],
    queryFn: async () => {
      if (!markets) return null;

      let sum = BigNumber(0);

      for (const market of markets) {
        const intervals = await client.fetchQuery(
          candleIntervalQueryOptions({ marketId: market.id })
        );
        const interval = Interval.HOURS_1;
        const candleId = getCandleId(intervals, interval)?.candleId;
        const from = String(toNanoSeconds(yesterday()));

        const candles = await client.fetchQuery(
          candleDataQueryOptions(client, {
            candleId: candleId || '',
            marketId: market.id,
            fromTimestamp: from,
          })
        );

        const notionalVol = candles?.reduce((acc, candle) => {
          return acc.plus(candle.notional.rawValue);
        }, new BigNumber(0));

        const asset = market.settlementAsset
          ? market.settlementAsset
          : market.quoteAsset;
        if (!asset) {
          throw new Error('could not determine settlement asset');
        }

        sum = sum.plus(notionalVol.div(asset.quantum));
      }

      return sum;
    },
    enabled: Boolean(markets?.length),
  });

  return queryResult;
}
