import { render, screen, waitFor } from '@testing-library/react';
import { createMarketFragment } from '@vegaprotocol/mock';
import { MarketSelectorItem } from './market-selector-item';
import { MemoryRouter } from 'react-router-dom';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type {
  MarketCandlesQuery,
  MarketCandlesQueryVariables,
  MarketDataUpdateFieldsFragment,
  MarketDataUpdateSubscription,
} from '@vegaprotocol/markets';
import { MarketCandlesDocument, getAsset } from '@vegaprotocol/markets';
import { MarketDataUpdateDocument } from '@vegaprotocol/markets';
import {
  AuctionTrigger,
  Interval,
  MarketState,
  MarketTradingMode,
} from '@vegaprotocol/types';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { subDays } from 'date-fns';

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
          __typename: 'Future',
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
    markPrice: '50000',
    midPrice: '100',
    staticMidPrice: '100',
    openInterest: '100',
    suppliedStake: '1000000',
    targetStake: '1000000',
    trigger: AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED,
    priceMonitoringBounds: null,
    lastTradedPrice: '100',
  };

  const candles = [
    {
      open: '5',
      close: '5',
      high: '5',
      low: '5',
      volume: '50',
      periodStart: yesterday.toISOString(),
    },
    {
      open: '10',
      close: '10',
      high: '10',
      low: '10',
      volume: '50',
      periodStart: yesterday.toISOString(),
    },
  ];

  const renderJsx = (mocks: MockedResponse[]) => {
    return render(
      <MemoryRouter>
        <MockedProvider mocks={mocks}>
          <MarketSelectorItem
            market={market}
            currentMarketId={market.id}
            style={{}}
            onSelect={jest.fn()}
            allProducts
          />
        </MockedProvider>
      </MemoryRouter>
    );
  };

  let dateSpy: jest.SpyInstance;
  const ts = 1685577600000; // 2023-06-01

  beforeAll(() => {
    dateSpy = jest.spyOn(Date, 'now').mockImplementation(() => ts);
  });

  afterAll(() => {
    dateSpy.mockRestore();
  });

  it('renders market information', async () => {
    const symbol = getAsset(market).symbol;

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

    const since = subDays(Date.now(), 5).toISOString();
    const variables: MarketCandlesQueryVariables = {
      marketId: market.id,
      interval: Interval.INTERVAL_I1H,
      since,
    };
    const mockCandles: MockedResponse<MarketCandlesQuery> = {
      request: {
        query: MarketCandlesDocument,
        variables,
      },
      result: {
        data: {
          marketsConnection: {
            edges: [
              {
                node: {
                  candlesConnection: {
                    edges: candles.map((c) => ({
                      node: c,
                    })),
                  },
                },
              },
            ],
          },
        },
      },
    };

    renderJsx([mock, mockCandles]);

    const link = screen.getByRole('link');
    // link renders and is styled
    expect(link).toHaveAttribute('href', '/markets/' + market.id);

    expect(link).toHaveClass('bg-vega-clight-600');

    expect(screen.getByTitle('24h vol')).toHaveTextContent('0.00');
    expect(screen.getByTitle(symbol)).toHaveTextContent('-');

    await waitFor(() => {
      expect(screen.getByTitle('24h vol')).toHaveTextContent('100');
      expect(screen.getByTitle(symbol)).toHaveTextContent(
        addDecimalsFormatNumber(marketData.markPrice, market.decimalPlaces)
      );
    });

    expect(screen.getByText('Futr')).toBeInTheDocument();
  });
});
