import merge from 'lodash/merge';
import { MarketTradingMode } from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import type { MarketDepth } from '../../../../../libs/market-depth/src/lib/__generated__/MarketDepth';

export const generateMarketDepth = (
  override?: PartialDeep<MarketDepth>
): MarketDepth => {
  const defaultResult: MarketDepth = {
    market: {
      id: 'market-0',
      decimalPlaces: 5,
      positionDecimalPlaces: 0,
      data: {
        marketTradingMode: MarketTradingMode.Continuous,
        staticMidPrice: '0',
        indicativePrice: '0',
        bestStaticBidPrice: '0',
        bestStaticOfferPrice: '0',
        indicativeVolume: '0',
        market: {
          id: '10cd0a793ad2887b340940337fa6d97a212e0e517fe8e9eab2b5ef3a38633f35',
          __typename: 'Market',
        },
        __typename: 'MarketData',
      },
      depth: {
        __typename: 'MarketDepth',
        buy: [],
        sell: [],
        lastTrade: null,
        sequenceNumber: '',
      },
      __typename: 'Market',
    },
  };

  return merge(defaultResult, override);
};
