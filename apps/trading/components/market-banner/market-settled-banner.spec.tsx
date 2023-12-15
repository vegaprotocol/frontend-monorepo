import { render, screen } from '@testing-library/react';
import { addDays, subDays, subHours } from 'date-fns';
import { MockedProvider, type MockedResponse } from '@apollo/react-testing';
import {
  SuccessorMarketDocument,
  MarketCandlesDocument,
  MarketCandlesUpdateDocument,
  SuccessorMarketIdDocument,
  type Market,
  type SuccessorMarketQuery,
  type SuccessorMarketQueryVariables,
  type MarketCandlesQuery,
  type MarketCandlesQueryVariables,
  type MarketCandlesUpdateSubscription,
  type MarketCandlesUpdateSubscriptionVariables,
  type SuccessorMarketIdQuery,
  type SuccessorMarketIdQueryVariables,
} from '@vegaprotocol/markets';
import { MemoryRouter } from 'react-router-dom';
import { createMarketFragment } from '@vegaprotocol/mock';
import { Interval, MarketState, MarketTradingMode } from '@vegaprotocol/types';
import { MarketSettledBanner } from './market-settled-banner';

describe('MarketSettledBanner', () => {
  const now = 1701388800000;
  const origDateNow = Date.now;

  beforeAll(() => {
    Date.now = () => now;
  });

  afterAll(() => {
    Date.now = origDateNow;
  });

  const marketId = 'market-0';
  const successorId = 'successor-id';
  const successorName = 'successor-name';

  const successorMarketIdMock: MockedResponse<
    SuccessorMarketIdQuery,
    SuccessorMarketIdQueryVariables
  > = {
    request: {
      query: SuccessorMarketIdDocument,
      variables: {
        marketId: marketId,
      },
    },
    result: {
      data: {
        market: {
          successorMarketID: successorId,
        },
      },
    },
  };

  const successorMock: MockedResponse<
    SuccessorMarketQuery,
    SuccessorMarketQueryVariables
  > = {
    request: {
      query: SuccessorMarketDocument,
      variables: {
        marketId: successorId,
      },
    },
    result: {
      data: {
        market: {
          id: successorId,
          state: MarketState.STATE_ACTIVE,
          tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
          positionDecimalPlaces: 0,
          tradableInstrument: {
            instrument: {
              name: successorName,
              code: 'code',
            },
          },
          proposal: {
            id: 'proposal-id',
          },
        },
      },
    },
  };

  const since = subDays(new Date(now), 5).toISOString();
  const successorCandlesMock: MockedResponse<
    MarketCandlesQuery,
    MarketCandlesQueryVariables
  > = {
    request: {
      query: MarketCandlesDocument,
      variables: {
        marketId: successorId,
        interval: Interval.INTERVAL_I1H,
        since,
      },
    },
    result: {
      data: {
        marketsConnection: {
          edges: [
            {
              node: {
                candlesConnection: {
                  edges: [
                    {
                      node: {
                        high: '100',
                        low: '100',
                        open: '100',
                        close: '100',
                        volume: '100',
                        periodStart: subHours(new Date(now), 1).toISOString(),
                      },
                    },
                    {
                      node: {
                        high: '100',
                        low: '100',
                        open: '100',
                        close: '200',
                        volume: '100',
                        periodStart: subHours(new Date(now), 2).toISOString(),
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    },
  };

  const successorCandlesUpdateMock: MockedResponse<
    MarketCandlesUpdateSubscription,
    MarketCandlesUpdateSubscriptionVariables
  > = {
    request: {
      query: MarketCandlesUpdateDocument,
      variables: {
        marketId: successorId,
        interval: Interval.INTERVAL_I1H,
        // @ts-ignore this query doesn't need the 'since' variable, but the data-provider
        // uses all variables for both the query and the subscription so its needed here
        // to match the mock
        since,
      },
    },
    result: {
      data: {
        candles: {
          high: '100',
          low: '100',
          open: '100',
          close: '100',
          volume: '100',
          periodStart: '2020-01-01T00:00:00',
        },
      },
    },
  };

  const renderComponent = (market: Market, mocks?: MockedResponse[]) => {
    return render(
      <MemoryRouter>
        <MockedProvider mocks={mocks}>
          <MarketSettledBanner market={market} />
        </MockedProvider>
      </MemoryRouter>
    );
  };

  it('shows that the market is settled if there is no successor', () => {
    const market = createMarketFragment({
      id: marketId,
      successorMarketID: undefined,
    });
    renderComponent(market, [successorMarketIdMock, successorMock]);
    expect(
      screen.getByText('This market has been settled')
    ).toBeInTheDocument();
  });

  it('shows that the market has been succeeded with an active market', async () => {
    const market = createMarketFragment({
      id: marketId,
      successorMarketID: successorId,
      marketTimestamps: {
        close: addDays(new Date(now), 1).toISOString(),
      },
    });
    renderComponent(market, [
      successorMarketIdMock,
      successorMock,
      successorCandlesMock,
      successorCandlesUpdateMock,
    ]);
    expect(
      await screen.findByText('This market has been succeeded')
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/has a 24h trading volume of 200$/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText('This market expires in 1 day.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: successorName })).toHaveAttribute(
      'href',
      `/markets/${successorId}`
    );
  });
});
