import { fireEvent, render, screen } from '@testing-library/react';
import { Schema } from '@vegaprotocol/types';

import type { ReactNode } from 'react';
import type { MarketListItemFragment } from '../__generated__/MarketList';
import type { MarketDataFieldsFragment } from '../__generated__/MarketData';
import type { MarketCandles } from '../markets-candles-provider';

import {
  SelectAllMarketsTableBody,
  SelectMarketLandingTable,
} from './select-market';

jest.mock(
  'next/link',
  () =>
    ({ children }: { children: ReactNode }) =>
      children
);

const MARKET_A: MarketListItemFragment = {
  __typename: 'Market',
  id: '1',
  decimalPlaces: 2,
  positionDecimalPlaces: 0,
  state: Schema.MarketState.STATE_ACTIVE,
  marketTimestamps: {
    open: '',
    close: '',
  },
  tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  tradableInstrument: {
    __typename: 'TradableInstrument',
    instrument: {
      __typename: 'Instrument',
      id: '1',
      code: 'ABCDEF',
      name: 'ABCDEF 1-Day',
      product: {
        __typename: 'Future',
        settlementAsset: {
          __typename: 'Asset',
          symbol: 'ABC',
        },
      },
      metadata: {
        __typename: 'InstrumentMetadata',
        tags: ['ABC', 'DEF'],
      },
    },
  },
  fees: {
    __typename: 'Fees',
    factors: {
      __typename: 'FeeFactors',
      infrastructureFee: '0.01',
      liquidityFee: '0.01',
      makerFee: '0.01',
    },
  },
};

const MARKET_B: MarketListItemFragment = {
  __typename: 'Market',
  id: '2',
  decimalPlaces: 2,
  positionDecimalPlaces: 0,
  state: Schema.MarketState.STATE_ACTIVE,
  marketTimestamps: {
    open: '',
    close: '',
  },
  tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  tradableInstrument: {
    __typename: 'TradableInstrument',
    instrument: {
      __typename: 'Instrument',
      id: '2',
      code: 'XYZ',
      name: 'XYZ 1-Day',
      product: {
        __typename: 'Future',
        settlementAsset: {
          __typename: 'Asset',
          symbol: 'XYZ',
        },
      },
      metadata: {
        __typename: 'InstrumentMetadata',
        tags: ['XYZ'],
      },
    },
  },
  fees: {
    __typename: 'Fees',
    factors: {
      __typename: 'FeeFactors',
      infrastructureFee: '0.01',
      liquidityFee: '0.01',
      makerFee: '0.01',
    },
  },
};

const MARKET_DATA_A: MarketDataFieldsFragment = {
  __typename: 'MarketData',
  market: {
    __typename: 'Market',
    state: Schema.MarketState.STATE_ACTIVE,
    id: '1',
    tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  },
  markPrice: '90',
  trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_OPENING,
  indicativeVolume: '1000',
  bestBidPrice: '10',
  bestOfferPrice: '10',
  staticMidPrice: '10',
  indicativePrice: '10',
  bestStaticBidPrice: '10',
  bestStaticOfferPrice: '10',
  marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
};

const MARKET_DATA_B: MarketDataFieldsFragment = {
  __typename: 'MarketData',
  market: {
    __typename: 'Market',
    state: Schema.MarketState.STATE_ACTIVE,
    id: '2',
    tradingMode: Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
  },
  markPrice: '123.123',
  trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_OPENING,
  indicativeVolume: '2000',
  bestBidPrice: '10',
  bestOfferPrice: '10',
  staticMidPrice: '10',
  indicativePrice: '10',
  bestStaticBidPrice: '10',
  bestStaticOfferPrice: '10',
  marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
};

const MARKET_CANDLES_A: MarketCandles = {
  marketId: '1',
  candles: [
    {
      __typename: 'CandleNode',
      high: '100',
      low: '10',
      open: '10',
      close: '80',
      volume: '1000',
    },
    {
      __typename: 'CandleNode',
      high: '10',
      low: '1',
      open: '1',
      close: '100',
      volume: '1000',
    },
  ],
};

const MARKET_CANDLES_B: MarketCandles = {
  marketId: '2',
  candles: [
    {
      __typename: 'CandleNode',
      high: '100',
      low: '10',
      open: '10',
      close: '80',
      volume: '1000',
    },
  ],
};

describe('SelectMarket', () => {
  it('should render the SelectAllMarketsTableBody', () => {
    const onSelect = jest.fn();
    const { container } = render(
      <SelectAllMarketsTableBody
        markets={[MARKET_A, MARKET_B]}
        marketsData={[MARKET_DATA_A, MARKET_DATA_B]}
        marketsCandles={[
          MARKET_CANDLES_A as MarketCandles,
          MARKET_CANDLES_B as MarketCandles,
        ]}
        onSelect={onSelect}
      />
    );
    expect(screen.getByText('ABCDEF')).toBeTruthy(); // name
    expect(screen.getByText('25.00%')).toBeTruthy(); // price change
    expect(container).toHaveTextContent(/1,000/); // volume
    fireEvent.click(screen.getByTestId(`market-link-1`));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('should call onSelect callback on SelectMarketLandingTable', () => {
    const onSelect = jest.fn();
    render(
      <SelectMarketLandingTable
        markets={[MARKET_A, MARKET_B]}
        marketsData={[MARKET_DATA_A, MARKET_DATA_B]}
        marketsCandles={[MARKET_CANDLES_A, MARKET_CANDLES_B]}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByTestId(`market-link-1`));
    expect(onSelect).toHaveBeenCalledWith('1');
    fireEvent.click(screen.getByTestId(`market-link-2`));
    expect(onSelect).toHaveBeenCalledWith('2');
  });
});
