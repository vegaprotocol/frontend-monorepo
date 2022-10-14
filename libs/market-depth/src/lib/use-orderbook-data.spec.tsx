import { MockedProvider } from '@apollo/client/testing';
import { renderHook, act } from '@testing-library/react';
import type {
  MarketDepth_market,
  MarketDepth_market_depth_buy,
  MarketDepth_market_depth_sell,
} from './';
import { useMarketDepth } from './use-market-depth';

const mockData: MarketDepth_market = {
  __typename: 'Market',
  id: 'marketId',
  depth: {
    __typename: 'MarketDepth',
    sell: [
      {
        __typename: 'PriceLevel',
        price: '7861',
        volume: '25631',
        numberOfOrders: '4',
      },
    ],
    buy: [
      {
        __typename: 'PriceLevel',
        price: '7820',
        volume: '28',
        numberOfOrders: '1',
      },
    ],
    sequenceNumber: '1661857812317962664',
  },
};

let updateMock: ({ data }: { data: MarketDepth_market }) => boolean;

const mockUseDataProvider = ({ update }: { update: () => boolean }) => {
  updateMock = update;
  return { data: mockData, loading: false, error: false };
};

jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useDataProvider: jest.fn((args) => mockUseDataProvider(args)),
}));

const modMock = (
  sell: MarketDepth_market_depth_sell[] | null,
  buy: MarketDepth_market_depth_buy[] | null
): MarketDepth_market => {
  return {
    ...mockData,
    depth: {
      ...mockData.depth,
      sell,
      buy,
    },
  };
};

describe('useMarketDepth hook', () => {
  it('should return proper data', () => {
    const { result } = renderHook(
      () => useMarketDepth({ variables: { marketId: 'marketId' } }),
      {
        wrapper: MockedProvider,
      }
    );
    expect(result.current.data).toEqual(mockData);
  });

  it('should update data object', () => {
    const { result } = renderHook(
      () => useMarketDepth({ variables: { marketId: 'marketId' } }),
      {
        wrapper: MockedProvider,
      }
    );
    expect(result.current.data?.depth.sell).toEqual(mockData.depth.sell);

    const updateMockData = modMock(null, mockData.depth.buy);

    act(() => {
      updateMock({ data: updateMockData });
    });
    expect(result.current.data?.depth.sell).toEqual(null);
  });

  it('throttling should delay update', async () => {
    const { result } = renderHook(
      () =>
        useMarketDepth({
          variables: { marketId: 'marketId' },
          throttleMilliseconds: 500,
        }),
      {
        wrapper: MockedProvider,
      }
    );
    expect(result.current.data?.depth.sell).toEqual(mockData.depth.sell);

    const updateMockData = modMock(null, mockData.depth.buy);
    const updateMockData2 = modMock(mockData.depth.sell, mockData.depth.buy);

    await act(async () => {
      updateMock({ data: updateMockData });
      updateMock({ data: updateMockData2 });
    });

    expect(result.current.data?.depth.sell).toEqual(null);
    await new Promise((res) => {
      setTimeout(res, 400);
    });
    expect(result.current.data?.depth.sell).toEqual(null);
    await new Promise((res) => {
      setTimeout(res, 200);
    });
    expect(result.current.data?.depth.sell).toEqual(mockData.depth.sell);
  });
});
