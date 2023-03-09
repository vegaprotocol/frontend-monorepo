import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import * as Schema from '@vegaprotocol/types';
import type { Market } from '@vegaprotocol/market-list';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useCalculateSlippage } from './use-calculate-slippage';

const mockData = {
  decimalPlaces: 0,
  positionDecimalPlaces: 0,
  depth: {
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
    ],
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
    ],
  },
};

let mockOrderBookData = {
  data: mockData,
};

jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useDataProvider: jest.fn(() => ({
    data: {
      marketsConnection: [],
    },
  })),
  useThrottledDataProvider: jest.fn(() => mockOrderBookData),
}));

describe('useCalculateSlippage Hook', () => {
  describe('calculate proper result', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    const market = {
      id: 'marketId',
      decimalPlaces: 0,
      positionDecimalPlaces: 0,
    } as Market;

    it('long order', () => {
      const { result } = renderHook(
        () =>
          useCalculateSlippage({
            market,
            order: {
              size: '10',
              side: Schema.Side.SIDE_BUY,
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
            market,
            order: {
              size: '10',
              side: Schema.Side.SIDE_SELL,
            } as OrderSubmissionBody['orderSubmission'],
          }),
        {
          wrapper: MockedProvider,
        }
      );
      expect(result.current).toEqual('31.11');
    });

    it('when no order book result should be null', () => {
      mockOrderBookData = {
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
            market,
            order: {
              size: '10',
              side: Schema.Side.SIDE_SELL,
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
