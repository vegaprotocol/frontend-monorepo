import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { MarketState } from '@vegaprotocol/types';
import SimpleMarketList from './simple-market-list';
import { MARKETS_QUERY } from './data-provider';
import type { SimpleMarkets_markets } from './__generated__/SimpleMarkets';
import type { SimpleMarkets } from './__generated__/SimpleMarkets';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('date-fns', () => ({
  subDays: () => new Date('2022-06-02T11:11:21.721Z'),
}));

describe('SimpleMarketList', () => {
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
      <MockedProvider mocks={[mocks]}>
        <SimpleMarketList />
      </MockedProvider>
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.getByText('No data to display')).toBeInTheDocument();
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
            state: MarketState.Proposed,
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
      <MockedProvider mocks={[mocks]}>
        <SimpleMarketList />
      </MockedProvider>
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
