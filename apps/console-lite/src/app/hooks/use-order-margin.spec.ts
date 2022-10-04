import { renderHook } from '@testing-library/react';
import { useQuery } from '@apollo/client';
import { BigNumber } from 'bignumber.js';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import type { DealTicketMarketFragment } from '@vegaprotocol/deal-ticket';
import type { PositionMargin } from './use-market-positions';
import useOrderMargin from './use-order-margin';

let mockEstimateData = {
  estimateOrder: {
    fee: {
      makerFee: '100000.000',
      infrastructureFee: '100000.000',
      liquidityFee: '100000.000',
    },
    marginLevels: {
      initialLevel: '200000',
    },
  },
};
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(() => ({ data: mockEstimateData })),
}));

let mockMarketPositions: PositionMargin = {
  openVolume: new BigNumber(1),
  balance: new BigNumber(100000),
};
jest.mock('./use-market-positions', () => jest.fn(() => mockMarketPositions));

describe('useOrderMargin Hook', () => {
  const order = {
    size: '2',
    side: 'SIDE_BUY',
    timeInForce: 'TIME_IN_FORCE_IOC',
    type: 'TYPE_MARKET',
  };
  const market = {
    id: 'marketId',
    depth: {
      lastTrade: {
        price: '1000000',
      },
    },
  };
  const partyId = 'partyId';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('margin should be properly calculated', () => {
    const { result } = renderHook(() =>
      useOrderMargin({
        order: order as OrderSubmissionBody['orderSubmission'],
        market: market as DealTicketMarketFragment,
        partyId,
      })
    );
    expect(result.current?.margin).toEqual('100000');

    const calledSize = new BigNumber(mockMarketPositions?.openVolume || 0)
      .plus(order.size)
      .toString();
    expect((useQuery as jest.Mock).mock.calls[1][1].variables.size).toEqual(
      calledSize
    );
  });

  it('fees should be properly calculated', () => {
    const { result } = renderHook(() =>
      useOrderMargin({
        order: order as OrderSubmissionBody['orderSubmission'],
        market: market as DealTicketMarketFragment,
        partyId,
      })
    );
    expect(result.current?.fees).toEqual('300000');
  });

  it('if there is no positions initialMargin should not be subtracted', () => {
    mockMarketPositions = null;
    const { result } = renderHook(() =>
      useOrderMargin({
        order: order as OrderSubmissionBody['orderSubmission'],
        market: market as DealTicketMarketFragment,
        partyId,
      })
    );
    expect(result.current?.margin).toEqual('200000');

    expect((useQuery as jest.Mock).mock.calls[1][1].variables.size).toEqual(
      order.size
    );
  });

  it('if api fails, should return empty value', () => {
    mockEstimateData = {
      estimateOrder: {
        fee: {
          makerFee: '100000.000',
          infrastructureFee: '100000.000',
          liquidityFee: '100000.000',
        },
        marginLevels: {
          initialLevel: '',
        },
      },
    };
    const { result } = renderHook(() =>
      useOrderMargin({
        order: order as OrderSubmissionBody['orderSubmission'],
        market: market as DealTicketMarketFragment,
        partyId,
      })
    );
    expect(result.current).toEqual(null);

    const calledSize = new BigNumber(mockMarketPositions?.openVolume || 0)
      .plus(order.size)
      .toString();
    expect((useQuery as jest.Mock).mock.calls[1][1].variables.size).toEqual(
      calledSize
    );
  });
});
