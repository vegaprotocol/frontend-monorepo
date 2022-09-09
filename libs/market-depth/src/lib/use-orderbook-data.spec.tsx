import { MockedProvider } from '@apollo/client/testing';
import { renderHook, act } from '@testing-library/react';
import { MarketTradingMode } from '@vegaprotocol/types';
import type {
  MarketDepthQuery,
  MarketDepthDataFieldsFragment,
} from './__generated__/MarketDepth';
import { useOrderBookData } from './use-orderbook-data';

const mockData: MarketDepthQuery['market'] = {
  __typename: 'Market',
  id: 'marketId',
  decimalPlaces: 5,
  positionDecimalPlaces: 0,
  data: {
    __typename: 'MarketData',
    staticMidPrice: '7820',
    marketTradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
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

let updateMock: ({ data }: { data: MarketDepthQuery['market'] }) => boolean;

const mockUseDataProvider = ({ update }: { update: () => boolean }) => {
  updateMock = update;
  return { data: mockData, loading: false, error: false };
};

jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useDataProvider: jest.fn((args) => mockUseDataProvider(args)),
}));

const modMock = (staticMidPrice: string): MarketDepthQuery['market'] => {
  return {
    ...mockData,
    data: {
      ...mockData.data,
      staticMidPrice,
    } as MarketDepthDataFieldsFragment,
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
