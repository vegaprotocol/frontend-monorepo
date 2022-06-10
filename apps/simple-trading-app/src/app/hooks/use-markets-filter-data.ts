import type { SimpleMarkets_markets } from '../components/simple-market-list/__generated__/SimpleMarkets';
import type { RouterParams } from '../components/simple-market-list/simple-market-list';

const useMarketsFilterData = (
  data: SimpleMarkets_markets[] = [],
  params: RouterParams
) => {
  return data.filter((item) => {
    if (
      params.product &&
      params.product !== item.tradableInstrument.instrument.product.__typename
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
      params.state === 'all' ? '' : params.state ? params.state : 'Active';
    if (state && state !== item.data?.market.state) {
      return false;
    }
    return true;
  });
};

export default useMarketsFilterData;
