import { useMemo, useRef } from 'react';
import type { MarketMarkPriceQuery } from './__generated__/MarketMarkPrice';
import { useMarketMarkPriceQuery } from './__generated__/MarketMarkPrice';

export const useMarketDataMarkPrice = (marketId: string) => {
  const memoRef = useRef<MarketMarkPriceQuery | null>(null);
  const { data } = useMarketMarkPriceQuery({
    pollInterval: 5000,
    variables: { marketId },
    skip: !marketId,
  });
  return useMemo(() => {
    if (
      data &&
      data.market?.data?.markPrice !== memoRef.current?.market?.data?.markPrice
    ) {
      memoRef.current = data;
    }
    return memoRef.current;
  }, [data, memoRef]);
};
