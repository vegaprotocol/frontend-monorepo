import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { MarketState } from '@vegaprotocol/types';
import SimpleMarketList from './simple-market-list';
import { FILTERS_QUERY, MARKETS_QUERY } from './data-provider';
import type {
  SimpleMarkets_markets,
  SimpleMarkets,
} from './__generated__/SimpleMarkets';
import type { MarketFilters } from './__generated__/MarketFilters';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useParams: () => ({}),
}));

jest.mock('date-fns', () => ({
  subDays: () => new Date('2022-06-02T11:11:21.721Z'),
}));

describe('SimpleMarketList', () => {
  const filterMock: MockedResponse<MarketFilters> = {
    request: {
      query: FILTERS_QUERY,
    },
    result: {
      data: { markets: [] },
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be properly renderer as empty', async () => {
    const mocks: MockedResponse<SimpleMarkets> = {
      request: {
        query: MARKETS_QUERY,
        variables: {
          CandleSince: '2022-06-02T11:11:21.721Z',
        },
      },
      result: {
        data: { markets: [] },
      },
    };

    render(
      <MockedProvider mocks={[mocks, filterMock]}>
        <SimpleMarketList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No data to display')).toBeInTheDocument();
    });
  });

  it('should be properly rendered with some data', async () => {
    const data = [
      {
        id: '1',
        data: {
          market: {
            state: MarketState.Active,
          },
        },
        tradableInstrument: {
          instrument: {
            product: {
              settlementAsset: {
                symbol: 'tUSD',
              },
            },
            metadata: {
              tags: [],
            },
          },
        },
      },
      {
        id: '2',
        data: {
          market: {
            state: MarketState.Active,
          },
        },
        tradableInstrument: {
          instrument: {
            product: {
              settlementAsset: {
                symbol: 'ETH',
              },
            },
            metadata: {
              tags: [],
            },
          },
        },
      },
    ] as unknown as SimpleMarkets_markets[];

    const mocks: MockedResponse<SimpleMarkets> = {
      request: {
        query: MARKETS_QUERY,
        variables: {
          CandleSince: '2022-06-02T11:11:21.721Z',
        },
      },
      result: {
        data: { markets: data },
      },
    };
    render(
      <MockedProvider mocks={[mocks, filterMock]}>
        <SimpleMarketList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('simple-market-list')).toBeInTheDocument();
      expect(screen.getByTestId('simple-market-list').children).toHaveLength(2);
    });
  });
});
