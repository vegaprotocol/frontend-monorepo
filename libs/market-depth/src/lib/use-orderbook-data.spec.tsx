import { MockedProvider } from '@apollo/client/testing';
import { renderHook, act } from '@testing-library/react';
import { useOrderBookData } from './use-orderbook-data';

const mockData = {
  __typename: 'Market',
  id: 'marketId',
  decimalPlaces: 5,
  positionDecimalPlaces: 0,
  data: {
    __typename: 'MarketData',
    staticMidPrice: '7820',
    marketTradingMode: 'TRADING_MODE_CONTINUOUS',
    indicativeVolume: '0',
    indicativePrice: '0',
    bestStaticBidPrice: '7820',
    bestStaticOfferPrice: '7821',
    market: {
      __typename: 'Market',
      id: 'marketId',
    },
  },
  depth: {
    __typename: 'MarketDepth',
    lastTrade: { __typename: 'Trade', price: '7846' },
    sell: [
      {
        __typename: 'PriceLevel',
        price: '7861',
        volume: '25631',
        numberOfOrders: '4',
      },
      {
        __typename: 'PriceLevel',
        price: '7862',
        volume: '19222',
        numberOfOrders: '4',
      },
      {
        __typename: 'PriceLevel',
        price: '7863',
        volume: '12814',
        numberOfOrders: '4',
      },
      {
        __typename: 'PriceLevel',
        price: '7905',
        volume: '6376',
        numberOfOrders: '4',
      },
      {
        __typename: 'PriceLevel',
        price: '8116',
        volume: '2',
        numberOfOrders: '2',
      },
    ],
    buy: [
      {
        __typename: 'PriceLevel',
        price: '7820',
        volume: '28',
        numberOfOrders: '1',
      },
      {
        __typename: 'PriceLevel',
        price: '7800',
        volume: '25826',
        numberOfOrders: '4',
      },
      {
        __typename: 'PriceLevel',
        price: '7799',
        volume: '19373',
        numberOfOrders: '4',
      },
      {
        __typename: 'PriceLevel',
        price: '7798',
        volume: '12917',
        numberOfOrders: '4',
      },
      {
        __typename: 'PriceLevel',
        price: '7776',
        volume: '6480',
        numberOfOrders: '4',
      },
    ],
    sequenceNumber: '1661857812317962664',
  },
};

let updateMock: ({ data }: { data: any }) => boolean;

const mockUseDataProvider = (args: any) => {
  updateMock = args.update;
  return { data: mockData, loading: false, error: false };
};

jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useDataProvider: jest.fn((args) => mockUseDataProvider(args)),
}));

const modMock = (staticMidPrice: string) => {
  return {
    ...mockData,
    data: {
      ...mockData.data,
      staticMidPrice,
    },
  };
};

describe('useOrderBookData hook', () => {
  it('should return proper data', () => {
    const { result } = renderHook(
      () => useOrderBookData({ variables: { marketId: 'marketId' } }),
      {
        wrapper: MockedProvider,
      }
    );
    expect(result.current.data).toEqual(mockData);
  });

  it('should update data object', () => {
    const { result } = renderHook(
      () => useOrderBookData({ variables: { marketId: 'marketId' } }),
      {
        wrapper: MockedProvider,
      }
    );
    expect(result.current.data?.data?.staticMidPrice).toEqual('7820');

    const updateMockData = modMock('1111');

    act(() => {
      updateMock({ data: updateMockData });
    });
    expect(result.current.data?.data?.staticMidPrice).toEqual('1111');
  });

  it('throttling should delay update', async () => {
    const { result } = renderHook(
      () =>
        useOrderBookData({
          variables: { marketId: 'marketId' },
          throttleMilliseconds: 500,
        }),
      {
        wrapper: MockedProvider,
      }
    );
    expect(result.current.data?.data?.staticMidPrice).toEqual('7820');

    const updateMockData = modMock('2222');
    const updateMockData2 = modMock('3333');

    await act(async () => {
      updateMock({ data: updateMockData });
      updateMock({ data: updateMockData2 });
    });

    expect(result.current.data?.data?.staticMidPrice).toEqual('2222');
    await new Promise((res) => {
      setTimeout(res, 400);
    });
    expect(result.current.data?.data?.staticMidPrice).toEqual('2222');
    await new Promise((res) => {
      setTimeout(res, 200);
    });
    expect(result.current.data?.data?.staticMidPrice).toEqual('3333');
  });
});
