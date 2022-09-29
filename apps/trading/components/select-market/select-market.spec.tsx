import { fireEvent, render, screen } from '@testing-library/react';
import { AuctionTrigger, MarketTradingMode } from '@vegaprotocol/types';
import type { ReactNode } from 'react';
import type {
  MarketData,
  MarketCandles,
  Market,
} from '@vegaprotocol/market-list';

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

const MARKET_A = {
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
} as Market;

const MARKET_B = {
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
} as Market;

const MARKET_DATA_A: Partial<MarketData> = {
  __typename: 'MarketData',
  market: {
    __typename: 'Market',
    id: '1',
  },
  markPrice: '90',
  trigger: AuctionTrigger.AUCTION_TRIGGER_OPENING,
  indicativeVolume: '1000',
};

const MARKET_DATA_B: Partial<MarketData> = {
  __typename: 'MarketData',
  market: {
    __typename: 'Market',
    id: '2',
  },
  markPrice: '123.123',
  trigger: AuctionTrigger.AUCTION_TRIGGER_OPENING,
  indicativeVolume: '2000',
};

const MARKET_CANDLES_A: Partial<MarketCandles> = {
  marketId: '1',
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

const MARKET_CANDLES_B: Partial<MarketCandles> = {
  marketId: '2',
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
        markets={[MARKET_A, MARKET_B]}
        marketsData={[MARKET_DATA_A as MarketData, MARKET_DATA_B as MarketData]}
        marketsCandles={[
          MARKET_CANDLES_A as MarketCandles,
          MARKET_CANDLES_B as MarketCandles,
        ]}
        onSelect={onSelect}
        onCellClick={onCellClick}
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
    const onCellClick = jest.fn();

    render(
      <SelectMarketLandingTable
        markets={[MARKET_A, MARKET_B]}
        marketsData={[MARKET_DATA_A as MarketData, MARKET_DATA_B as MarketData]}
        marketsCandles={[
          MARKET_CANDLES_A as MarketCandles,
          MARKET_CANDLES_B as MarketCandles,
        ]}
        onSelect={onSelect}
        onCellClick={onCellClick}
      />
    );
    fireEvent.click(screen.getByTestId(`market-link-1`));
    expect(onSelect).toHaveBeenCalledWith('1');
    fireEvent.click(screen.getByTestId(`market-link-2`));
    expect(onSelect).toHaveBeenCalledWith('2');
  });
});
