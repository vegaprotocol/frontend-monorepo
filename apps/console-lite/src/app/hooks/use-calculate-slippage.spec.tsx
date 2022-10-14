import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { Side } from '@vegaprotocol/types';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import type { MarketDepth_market } from '@vegaprotocol/market-depth';
import useCalculateSlippage from './use-calculate-slippage';

const mockData: MarketDepth_market = {
  __typename: 'Market',
  id: 'marketId',
  depth: {
    __typename: 'MarketDepth',
    sequenceNumber: '1',
    buy: [
      {
        price: '5',
        volume: '2',
      },
      {
        price: '4',
        volume: '3',
      },
      {
        price: '3',
        volume: '2',
      },
      {
        price: '2',
        volume: '1',
      },
      {
        price: '1',
        volume: '1',
      },
    ].map((d) => ({ __typename: 'PriceLevel', numberOfOrders: '1', ...d })),
    sell: [
      {
        price: '6',
        volume: '1',
      },
      {
        price: '7',
        volume: '3',
      },
      {
        price: '8',
        volume: '2',
      },
      {
        price: '9',
        volume: '1',
      },
      {
        price: '10',
        volume: '2',
      },
    ].map((d) => ({ __typename: 'PriceLevel', numberOfOrders: '1', ...d })),
  },
};

let mockMarketDepthData = {
  data: mockData,
};

jest.mock('@vegaprotocol/market-depth', () => ({
  ...jest.requireActual('@vegaprotocol/market-depth'),
  useMarketDepth: jest.fn(() => mockMarketDepthData),
}));

jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useDataProvider: jest.fn(() => ({
    data: {
      marketsConnection: [],
    },
  })),
}));

describe('useCalculateSlippage Hook', () => {
  describe('calculate proper result', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('long order', () => {
      const { result } = renderHook(
        () =>
          useCalculateSlippage({
            marketId: 'marketId',
            order: {
              size: '10',
              side: Side.SIDE_BUY,
            } as OrderSubmissionBody['orderSubmission'],
          }),
        {
          wrapper: MockedProvider,
        }
      );
      expect(result.current).toEqual('33.33');
    });

    it('short order', () => {
      const { result } = renderHook(
        () =>
          useCalculateSlippage({
            marketId: 'marketId',
            order: {
              size: '10',
              side: Side.SIDE_SELL,
            } as OrderSubmissionBody['orderSubmission'],
          }),
        {
          wrapper: MockedProvider,
        }
      );
      expect(result.current).toEqual('31.11');
    });

    it('when no order book result should be null', () => {
      mockMarketDepthData = {
        data: {
          ...mockData,
          depth: {
            ...mockData.depth,
            buy: [],
          },
        },
      };
      const { result } = renderHook(
        () =>
          useCalculateSlippage({
            marketId: 'marketId',
            order: {
              size: '10',
              side: Side.SIDE_SELL,
            } as OrderSubmissionBody['orderSubmission'],
          }),
        {
          wrapper: MockedProvider,
        }
      );
      expect(result.current).toBeNull();
    });
  });
});
