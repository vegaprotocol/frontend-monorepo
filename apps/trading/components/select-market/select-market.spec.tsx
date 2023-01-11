import { fireEvent, render, screen } from '@testing-library/react';
import * as Schema from '@vegaprotocol/types';

import { SelectAllMarketsTableBody } from './select-market';

import type {
  MarketMaybeWithCandles,
  MarketMaybeWithData,
  MarketData,
} from '@vegaprotocol/market-list';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
type Market = MarketMaybeWithCandles & MarketMaybeWithData;

type PartialMarket = Partial<
  Omit<Market, 'data'> & { data: Partial<MarketData> }
>;

const MARKET_A: PartialMarket = {
  __typename: 'Market',
  id: '1',
  decimalPlaces: 2,
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
        quoteName: 'ABCDEF',
        settlementAsset: {
          __typename: 'Asset',
          id: 'asset-ABC',
          name: '',
          decimals: 2,
          symbol: 'ABC',
        },
        dataSourceSpecForTradingTermination: {
          id: '',
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
    trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_OPENING,
    marketState: Schema.MarketState.STATE_PENDING,
    marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
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
      periodStart: '2022-11-01T15:49:00Z',
    },
    {
      __typename: 'Candle',
      high: '10',
      low: '1',
      open: '1',
      close: '100',
      volume: '1000',
      periodStart: '2022-11-01T15:50:00Z',
    },
  ],
};

const MARKET_B: PartialMarket = {
  __typename: 'Market',
  id: '2',
  decimalPlaces: 2,
  positionDecimalPlaces: 0,
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
        quoteName: 'XYZ',
        settlementAsset: {
          __typename: 'Asset',
          id: 'asset-XYZ',
          name: 'asset-XYZ',
          decimals: 2,
          symbol: 'XYZ',
        },
        dataSourceSpecForTradingTermination: {
          id: '',
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
    trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_OPENING,
    marketState: Schema.MarketState.STATE_PENDING,
    marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
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
      periodStart: '2022-11-01T15:49:00Z',
    },
  ],
};

describe('SelectMarket', () => {
  it('should render the SelectAllMarketsTableBody', () => {
    const onSelect = jest.fn();
    const onCellClick = jest.fn();
    const { container } = render(
      <MemoryRouter>
        <SelectAllMarketsTableBody
          markets={[MARKET_A as Market, MARKET_B as Market]}
          onCellClick={onCellClick}
          onSelect={onSelect}
        />
      </MemoryRouter>,
      { wrapper: MockedProvider }
    );
    expect(screen.getByText('ABCDEF')).toBeTruthy(); // name
    expect(screen.getByText('25.00%')).toBeTruthy(); // price change
    expect(container).toHaveTextContent(/1,000/); // volume
    fireEvent.click(screen.getAllByTestId(`market-link-1`)[0]);
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
