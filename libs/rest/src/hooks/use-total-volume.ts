import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMarketsList } from './use-markets';
import { getCandleId, Interval } from '../queries/candle-intervals';
import { toNanoSeconds, yesterday } from '../utils';
import {
  candleDataQueryOptions,
  candleIntervalQueryOptions,
} from './use-candles';
import BigNumber from 'bignumber.js';

export function useTotalVolume() {
  const client = useQueryClient();
  const { data: markets } = useMarketsList();

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

        sum = sum.plus(notionalVol.div(market.quoteAsset.quantum));
      }

      return sum;
    },
    enabled: Boolean(markets?.length),
  });

  return queryResult;
}
