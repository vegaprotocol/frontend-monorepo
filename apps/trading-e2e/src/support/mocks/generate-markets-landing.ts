import merge from 'lodash/merge';
import { MarketTradingMode } from '@vegaprotocol/types';

export const generateMarketsLanding = (override?: any) => {
  const markets = [
    {
      id: 'market-0',
      tradingMode: MarketTradingMode.Continuous,
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: '1',
      },
      __typename: 'Market',
    },
    {
      id: 'market-1',
      tradingMode: MarketTradingMode.OpeningAuction,
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: '2',
      },
      __typename: 'Market',
    },
  ];
  const defaultResult = {
    markets,
  };

  return merge(defaultResult, override);
};
