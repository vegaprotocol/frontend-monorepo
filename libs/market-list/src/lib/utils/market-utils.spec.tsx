import { Schema } from '@vegaprotocol/types';
import type { MarketListItemFragment } from '../__generated__/MarketData';
import { mapDataToMarketList } from './market-utils';

const MARKET_A: Partial<MarketListItemFragment> = {
  id: '1',
  marketTimestamps: {
    __typename: 'MarketTimestamps',
    open: '2022-05-18T13:08:27.693537312Z',
    close: null,
  },
  state: Schema.MarketState.STATE_ACTIVE,
  tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
};

const MARKET_B: Partial<MarketListItemFragment> = {
  id: '2',
  marketTimestamps: {
    __typename: 'MarketTimestamps',
    open: '2022-05-18T13:00:39.328347732Z',
    close: null,
  },
  state: Schema.MarketState.STATE_ACTIVE,
  tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
};

const MARKET_C: Partial<MarketListItemFragment> = {
  id: '3',
  marketTimestamps: {
    __typename: 'MarketTimestamps',
    open: '2022-05-17T13:00:39.328347732Z',
    close: null,
  },
  state: Schema.MarketState.STATE_REJECTED,
  tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
};

const MARKET_D: Partial<MarketListItemFragment> = {
  id: '4',
  marketTimestamps: {
    __typename: 'MarketTimestamps',
    open: '2022-05-16T13:00:39.328347732Z',
    close: null,
  },
  state: Schema.MarketState.STATE_ACTIVE,
  tradingMode: Schema.MarketTradingMode.TRADING_MODE_NO_TRADING,
};

describe('mapDataToMarketList', () => {
  it('should map queried data to market list format', () => {
    const result = mapDataToMarketList([
      MARKET_A,
      MARKET_B,
      MARKET_C,
      MARKET_D,
    ] as unknown as MarketListItemFragment[]);
    expect(result).toEqual([MARKET_B, MARKET_A]);
  });
});
