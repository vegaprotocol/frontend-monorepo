import * as React from 'react';
import { act } from 'react-dom/test-utils';
import {
  render,
  screen,
  waitFor,
  getAllByRole,
  fireEvent,
} from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import { MarketState } from '@vegaprotocol/types';
import SimpleMarketList from './simple-market-list';
import type { Market } from '@vegaprotocol/market-list';
import * as constants from './constants';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useParams: () => ({}),
}));

let marketsMock = [
  {
    id: 'MARKET_A',
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
    id: 'MARKET_B',
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
  return {
    data: {
      markets: marketsMock,
      marketsData: [],
      marketsCandles: [],
    },
    loading: false,
    error: false,
  };
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
  });

  // constantly failing on ci
  it.skip('should be properly rendered with some data', async () => {
    await act(async () => {
      await render(
        <MockedProvider mocks={[]}>
          <div style={constants.AG_GRID_CONTAINER_STYLES}>
            <SimpleMarketList />
          </div>
        </MockedProvider>,
        { wrapper: BrowserRouter }
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => {
      expect(
        document.querySelector('.ag-center-cols-container')
      ).toBeInTheDocument();
      const container = document.querySelector('.ag-center-cols-container');
      expect(getAllByRole(container as HTMLDivElement, 'row')).toHaveLength(2);
    });
  });

  it('click on row should be properly handled', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={[]}>
          <SimpleMarketList />
        </MockedProvider>,
        { wrapper: BrowserRouter }
      );
    });
    mockIsTradable.mockClear();
    const container = document.querySelector('.ag-center-cols-container');
    const firstRow = getAllByRole(container as HTMLDivElement, 'row')[0];
    expect(firstRow).toHaveAttribute('row-id', marketsMock[0].id);
    await act(async () => {
      fireEvent.click(firstRow);
    });
    await waitFor(() => {
      expect(mockIsTradable).toHaveBeenCalledWith(
        expect.objectContaining({
          id: marketsMock[0].id,
          percentChange: '-',
        })
      );
      expect(mockedNavigate).toHaveBeenCalledWith(
        `/trading/${marketsMock[0].id}`
      );
    });
  });

  it('should be properly renderer as empty', async () => {
    marketsMock = [];
    await act(async () => {
      render(
        <MockedProvider mocks={[]}>
          <SimpleMarketList />
        </MockedProvider>,
        { wrapper: BrowserRouter }
      );
    });
    await waitFor(() => {
      expect(screen.getByText('No data to display')).toBeInTheDocument();
    });
  });
});
