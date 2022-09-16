import { useMemo } from 'react';
import type { RouterParams } from '../components/simple-market-list/simple-market-list';
import { MarketState } from '@vegaprotocol/types';
import type { MarketsListData } from '@vegaprotocol/market-list';

const useMarketsFilterData = (data: MarketsListData, params: RouterParams) => {
  const markets =
    useMemo(
      () =>
        data?.markets?.filter((item) => {
          if (
            params.product &&
            params.product !==
              item.tradableInstrument.instrument.product.__typename
          ) {
            return false;
          }
          if (
            params.asset &&
            params.asset !== 'all' &&
            params.asset !==
              item.tradableInstrument.instrument.product.settlementAsset.symbol
          ) {
            return false;
          }
          const state =
            params.state === 'all'
              ? ''
              : params.state
              ? params.state
              : MarketState.STATE_ACTIVE;
          if (state && state !== item.state) {
            return false;
          }
          return true;
        }),
      [data, params.state, params.product, params.asset]
    ) || [];

  return useMemo(
    () =>
      markets.map((market) => ({
        ...market,
        candles: (data?.marketsCandles || [])
          .filter((c) => c.marketId === market.id)
          .map((c) => c.candles),
      })),
    [markets, data?.marketsCandles]
  );
};

export default useMarketsFilterData;
