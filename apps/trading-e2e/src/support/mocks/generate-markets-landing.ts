import merge from 'lodash/merge';
import { MarketTradingMode } from '@vegaprotocol/types';
import type { DeepPartial } from 'react-hook-form';

export interface MarketsLanding_markets_marketTimestamps {
  __typename: 'MarketTimestamps';
  open: string | null;
}

export interface MarketsLanding_markets {
  __typename: 'Market';
  id: string;
  tradingMode: MarketTradingMode;
  marketTimestamps: MarketsLanding_markets_marketTimestamps;
}

export interface MarketsLanding {
  markets: MarketsLanding_markets[] | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateMarketsLanding = (
  override?: DeepPartial<MarketsLanding>
): MarketsLanding => {
  const markets: MarketsLanding_markets[] = [
    {
      id: 'market-0',
      tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: '1',
      },
      __typename: 'Market',
    },
    {
      id: 'market-1',
      tradingMode: MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: '2',
      },
      __typename: 'Market',
    },
  ];

  const defaultResult: MarketsLanding = {
    markets,
  };

  return merge(defaultResult, override);
};
