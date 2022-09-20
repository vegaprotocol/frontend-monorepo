import { useMemo } from 'react';
import { MarketState } from '@vegaprotocol/types';
import type { MarketsListData } from '@vegaprotocol/market-list';
import type { RouterParams } from './simple-market-list';

const useMarketsFilterData = (data: MarketsListData, params: RouterParams) => {
  return useMemo(() => {
    const markets =
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
      }) || [];

    return markets.map((market) => ({
      ...market,
      candles: (data?.marketsCandles || [])
        .filter((c) => c.marketId === market.id)
        .map((c) => c.candles),
    }));
  }, [
    data?.marketsCandles,
    data?.markets,
    params.product,
    params.asset,
    params.state,
  ]);
};

export default useMarketsFilterData;
