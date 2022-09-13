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
import type { Market, MarketsListData } from '@vegaprotocol/market-list';
import { MARKET_LIST_QUERY } from '@vegaprotocol/market-list';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useParams: () => ({}),
}));

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
] as unknown as Market[];

const LIB = '@vegaprotocol/market-list';
const useMarketList = () => {
  return { data: mockData, loading: false, error: false };
};
jest.mock(LIB, () => ({
  ...jest.requireActual(LIB),
  useMarketList: jest.fn(() => useMarketList()),
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

  const mocks: MockedResponse<MarketsListData> = {
    request: {
      query: MARKET_LIST_QUERY,
    },
    result: {
      data: { markets: mockData, marketsCandles: [], marketsData: [] },
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
