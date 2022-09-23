import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import type { MarketDepthQuery } from './';
import { useOrderBookData } from './use-orderbook-data';

const mockData: MarketDepthQuery['market'] = {
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

const mockUseDataProvider = () => {
  return { data: mockData, loading: false, error: false };
};

jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useDataProvider: jest.fn(() => mockUseDataProvider()),
}));

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
});
