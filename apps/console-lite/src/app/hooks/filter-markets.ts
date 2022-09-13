import type { RouterParams } from '../components/simple-market-list/simple-market-list';
import { MarketState } from '@vegaprotocol/types';
import type { Market } from '@vegaprotocol/market-list';

const filterMarkets = (data: Market[], params: RouterParams) => {
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
      params.state === 'all'
        ? ''
        : params.state
        ? params.state
        : MarketState.STATE_ACTIVE;
    if (state && state !== item.state) {
      return false;
    }
    return true;
  });
};

export default filterMarkets;
