import { renderHook } from '@testing-library/react';
import { useQuery } from '@apollo/client';
import { BigNumber } from 'bignumber.js';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import type { PositionMargin } from './use-market-positions';
import { useOrderMargin } from './use-order-margin';
import type { DealTicketMarketFragment } from '../components/deal-ticket/__generated__/DealTicket';

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

jest.mock('./use-market-positions', () => ({
  useMarketPositions: ({
    marketId,
    partyId,
  }: {
    marketId: string;
    partyId: string;
  }) => mockMarketPositions,
}));

describe('useOrderMargin', () => {
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

  it('should calculate margin correctly', () => {
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

  it('should calculate fees correctly', () => {
    const { result } = renderHook(() =>
      useOrderMargin({
        order: order as OrderSubmissionBody['orderSubmission'],
        market: market as DealTicketMarketFragment,
        partyId,
      })
    );
    expect(result.current?.totalFees).toEqual('300000');
  });

  it('should not subtract initialMargin if there is no position', () => {
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

  it('should return empty value if API fails', () => {
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
