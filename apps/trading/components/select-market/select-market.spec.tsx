import { fireEvent, render, screen } from '@testing-library/react';
import { AuctionTrigger, MarketTradingMode } from '@vegaprotocol/types';

import {
  SelectAllMarketsTableBody,
  SelectMarketLandingTable,
} from './select-market';

import type { ReactNode } from 'react';
import type {
  MarketWithCandles,
  MarketWithData,
  MarketData,
} from '@vegaprotocol/market-list';
type Market = MarketWithCandles & MarketWithData;

jest.mock(
  'next/link',
  () =>
    ({ children }: { children: ReactNode }) =>
      children
);

type PartialMarket = Partial<
  Omit<Market, 'data'> & { data: Partial<MarketData> }
>;

const MARKET_A: PartialMarket = {
  __typename: 'Market',
  id: '1',
  decimalPlaces: 2,
  tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
  tradableInstrument: {
    __typename: 'TradableInstrument',
    instrument: {
      __typename: 'Instrument',
      id: '1',
      code: 'ABCDEF',
      name: 'ABCDEF 1-Day',
      product: {
        __typename: 'Future',
        quoteName: 'ABCDEF',
        settlementAsset: {
          __typename: 'Asset',
          decimals: 2,
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
  data: {
    __typename: 'MarketData',
    market: {
      __typename: 'Market',
      id: '1',
    },
    markPrice: '90',
    trigger: AuctionTrigger.AUCTION_TRIGGER_OPENING,
    indicativeVolume: '1000',
  },
  candles: [
    {
      __typename: 'Candle',
      high: '100',
      low: '10',
      open: '10',
      close: '80',
      volume: '1000',
    },
    {
      __typename: 'Candle',
      high: '10',
      low: '1',
      open: '1',
      close: '100',
      volume: '1000',
    },
  ],
};

const MARKET_B: PartialMarket = {
  __typename: 'Market',
  id: '2',
  decimalPlaces: 2,
  tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
  tradableInstrument: {
    __typename: 'TradableInstrument',
    instrument: {
      __typename: 'Instrument',
      id: '2',
      code: 'XYZ',
      name: 'XYZ 1-Day',
      product: {
        __typename: 'Future',
        quoteName: 'XYZ',
        settlementAsset: {
          __typename: 'Asset',
          decimals: 2,
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
  data: {
    __typename: 'MarketData',
    market: {
      __typename: 'Market',
      id: '2',
    },
    markPrice: '123.123',
    trigger: AuctionTrigger.AUCTION_TRIGGER_OPENING,
    indicativeVolume: '2000',
  },
  candles: [
    {
      __typename: 'Candle',
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
    const onCellClick = jest.fn();
    const { container } = render(
      <SelectAllMarketsTableBody
        markets={[MARKET_A as Market, MARKET_B as Market]}
        onCellClick={onCellClick}
        onSelect={onSelect}
      />
    );
    expect(screen.getByText('ABCDEF')).toBeTruthy(); // name
    expect(screen.getByText('25.00%')).toBeTruthy(); // price change
    expect(container).toHaveTextContent(/1,000/); // volume
    fireEvent.click(screen.getAllByTestId(`market-link-1`)[0]);
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('should call onSelect callback on SelectMarketLandingTable', () => {
    const onSelect = jest.fn();
    const onCellClick = jest.fn();

    render(
      <SelectMarketLandingTable
        markets={[MARKET_A as Market, MARKET_B as Market]}
        onCellClick={onCellClick}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getAllByTestId(`market-link-1`)[0]);
    expect(onSelect).toHaveBeenCalledWith('1');
    fireEvent.click(screen.getAllByTestId(`market-link-2`)[0]);
    expect(onSelect).toHaveBeenCalledWith('2');
  });
});
