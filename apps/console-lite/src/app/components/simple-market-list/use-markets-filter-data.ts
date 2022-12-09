import { useMemo } from 'react';
import * as Schema from '@vegaprotocol/types';
import type { MarketWithCandles } from '@vegaprotocol/market-list';
import type { RouterParams } from './simple-market-list';

const useMarketsFilterData = (
  data: MarketWithCandles[] | null,
  params: RouterParams
) => {
  return useMemo(() => {
    return (
      data?.filter((item) => {
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
            : Schema.MarketState.STATE_ACTIVE;
        if (state && state !== item.state) {
          return false;
        }
        return true;
      }) || []
    );
  }, [data, params.product, params.asset, params.state]);
};

export default useMarketsFilterData;
