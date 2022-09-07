import * as React from 'react';
import { act } from 'react-dom/test-utils';
import {
  render,
  screen,
  waitFor,
  cleanup,
  getAllByRole,
  fireEvent,
} from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import { MarketState } from '@vegaprotocol/types';
import SimpleMarketList from './simple-market-list';
import { MARKETS_QUERY } from './data-provider';
import type {
  SimpleMarkets_markets,
  SimpleMarkets,
} from './__generated__/SimpleMarkets';
import type { SimpleMarketDataSub_marketData } from './__generated__/SimpleMarketDataSub';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useParams: () => ({}),
}));

jest.mock('date-fns', () => ({
  subDays: () => new Date('2022-06-02T11:11:21.721Z'),
}));

let updateMock: ({
  delta,
}: {
  delta: SimpleMarketDataSub_marketData;
}) => boolean;

let mockData = [
  {
    id: '1',
    name: 'Market 1',
    state: MarketState.STATE_ACTIVE,
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
    name: 'Market 2',
    state: MarketState.STATE_ACTIVE,
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

const mockUseDataProvider = ({ update }: { update: () => boolean }) => {
  updateMock = update;
  return { data: mockData, loading: false, error: false };
};

jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useDataProvider: jest.fn((args) => mockUseDataProvider(args)),
}));

const mockIsTradable = jest.fn((_arg) => true);

jest.mock('../../constants', () => ({
  ...jest.requireActual('../../constants'),
  IS_MARKET_TRADABLE: jest.fn((arg) => mockIsTradable(arg)),
}));

describe('SimpleMarketList', () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  const mocks: MockedResponse<SimpleMarkets> = {
    request: {
      query: MARKETS_QUERY,
      variables: {
        CandleSince: '2022-06-02T11:11:21.721Z',
      },
    },
    result: {
      data: { markets: mockData },
    },
  };

  it('should be properly rendered with some data', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={[mocks]}>
          <SimpleMarketList />
        </MockedProvider>,
        { wrapper: BrowserRouter }
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => {
      expect(
        document.querySelector('.ag-center-cols-container')
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      const container = document.querySelector('.ag-center-cols-container');
      expect(getAllByRole(container as HTMLDivElement, 'row')).toHaveLength(2);
    });
  });

  it('update should return proper boolean value', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={[mocks]}>
          <SimpleMarketList />
        </MockedProvider>,
        { wrapper: BrowserRouter }
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => {
      expect(
        document.querySelector('.ag-center-cols-container')
      ).toBeInTheDocument();
    });

    await expect(
      updateMock({
        delta: {
          __typename: 'MarketData',
          market: {
            __typename: 'Market',
            id: '2',
            state: MarketState.STATE_ACTIVE,
          },
        },
      })
    ).toEqual(true);

    await expect(
      updateMock({
        delta: {
          __typename: 'MarketData',
          market: {
            __typename: 'Market',
            id: '2',
            state: MarketState.STATE_SUSPENDED,
          },
        },
      })
    ).toEqual(false);
  });

  it('click on row should be properly handled', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={[mocks]}>
          <SimpleMarketList />
        </MockedProvider>,
        { wrapper: BrowserRouter }
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => {
      expect(
        document.querySelector('.ag-center-cols-container')
      ).toBeInTheDocument();
    });
    mockIsTradable.mockClear();
    const container = document.querySelector('.ag-center-cols-container');
    const firstRow = getAllByRole(container as HTMLDivElement, 'row')[0];
    expect(firstRow).toHaveAttribute('row-id', '1');
    fireEvent.click(firstRow);
    await waitFor(() => {
      expect(mockIsTradable).toHaveBeenCalledWith({
        ...mockData[0],
        percentChange: '-',
      });
      expect(mockedNavigate).toHaveBeenCalledWith(`/trading/${mockData[0].id}`);
    });
  });

  it('should be properly renderer as empty', async () => {
    mockData = [];
    await act(async () => {
      render(
        <MockedProvider mocks={[mocks]}>
          <SimpleMarketList />
        </MockedProvider>,
        { wrapper: BrowserRouter }
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => {
      expect(screen.getByText('No data to display')).toBeInTheDocument();
    });
  });
});
