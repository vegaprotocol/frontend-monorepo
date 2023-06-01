import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMarketFragment } from '@vegaprotocol/mock';
import { MarketSelectorItem } from './market-selector-item';
import { MemoryRouter } from 'react-router-dom';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type {
  MarketDataUpdateFieldsFragment,
  MarketDataUpdateSubscription,
} from '@vegaprotocol/markets';
import { MarketDataUpdateDocument } from '@vegaprotocol/markets';
import {
  AuctionTrigger,
  MarketState,
  MarketTradingMode,
} from '@vegaprotocol/types';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

jest.mock('@vegaprotocol/markets', () => ({
  ...jest.requireActual('@vegaprotocol/markets'),
  useCandles: jest.fn(() => {
    const yesterday = new Date();
    return {
      oneDayCandles: [
        { close: '5', volume: '50', periodStart: yesterday.toISOString() },
        { close: '10', volume: '50', periodStart: yesterday.toISOString() },
      ],
    };
  }),
}));

describe('MarketSelectorItem', () => {
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 20);
  const market = createMarketFragment({
    id: 'market-0',
    decimalPlaces: 2,
    // @ts-ignore fragment doesn't contain candles
    candles: [
      { close: '5', volume: '50', periodStart: yesterday.toISOString() },
      { close: '10', volume: '50', periodStart: yesterday.toISOString() },
    ],
    tradableInstrument: {
      instrument: {
        product: {
          settlementAsset: {
            symbol: 'SYM',
          },
        },
      },
    },
  });
  const marketData: MarketDataUpdateFieldsFragment = {
    __typename: 'ObservableMarketData',
    marketId: market.id,
    auctionEnd: null,
    auctionStart: null,
    bestBidPrice: '100',
    bestBidVolume: '100',
    bestOfferPrice: '100',
    bestOfferVolume: '100',
    bestStaticBidPrice: '100',
    bestStaticBidVolume: '100',
    bestStaticOfferPrice: '100',
    bestStaticOfferVolume: '100',
    indicativePrice: '100',
    indicativeVolume: '100',
    marketState: MarketState.STATE_ACTIVE,
    marketTradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
    marketValueProxy: '100',
    markPrice: '50000',
    midPrice: '100',
    staticMidPrice: '100',
    openInterest: '100',
    suppliedStake: '1000000',
    targetStake: '1000000',
    trigger: AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
    priceMonitoringBounds: null,
  };
  const mock: MockedResponse<MarketDataUpdateSubscription> = {
    request: {
      query: MarketDataUpdateDocument,
      variables: {
        marketId: market.id,
      },
    },
    result: {
      data: {
        marketsData: [marketData],
      },
    },
  };

  const mockOnSelect = jest.fn();

  const renderJsx = () => {
    return render(
      <MemoryRouter>
        <MockedProvider mocks={[mock]}>
          <MarketSelectorItem
            market={market}
            currentMarketId={market.id}
            style={{}}
            onSelect={mockOnSelect}
          />
        </MockedProvider>
      </MemoryRouter>
    );
  };

  it('renders market information', async () => {
    const symbol =
      market.tradableInstrument.instrument.product.settlementAsset.symbol;

    renderJsx();

    const link = screen.getByRole('link');
    // link renders and is styled
    expect(link).toHaveAttribute('href', '/markets/' + market.id);

    expect(link).toHaveClass('ring-1');

    expect(screen.getByTitle('24h vol')).toHaveTextContent('100');
    expect(screen.getByTitle(symbol)).toHaveTextContent('-');

    // candles are loaded immediately
    expect(screen.getByTestId('market-item-change')).toHaveTextContent(
      '+100.00%'
    );

    await waitFor(() => {
      expect(screen.getByTitle(symbol)).toHaveTextContent(
        addDecimalsFormatNumber(marketData.markPrice, market.decimalPlaces)
      );
    });

    await userEvent.click(link);

    expect(mockOnSelect).toHaveBeenCalledWith(market.id);
  });
});
