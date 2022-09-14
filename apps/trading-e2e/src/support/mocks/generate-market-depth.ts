import merge from 'lodash/merge';
import { Schema } from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import type { MarketDepthQuery } from '@vegaprotocol/market-depth';

export const generateMarketDepth = (
  override?: PartialDeep<MarketDepthQuery>
): MarketDepthQuery => {
  const defaultResult: MarketDepthQuery = {
    market: {
      id: 'market-0',
      decimalPlaces: 5,
      positionDecimalPlaces: 0,
      data: {
        marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
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
        sequenceNumber: '',
      },
      __typename: 'Market',
    },
  };

  return merge(defaultResult, override);
};
