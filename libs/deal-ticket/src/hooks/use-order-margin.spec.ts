import { renderHook } from '@testing-library/react';
import { useQuery } from '@apollo/client';
import { BigNumber } from 'bignumber.js';
import type { PositionMargin } from './use-market-positions';
import type { Props } from './use-order-margin';
import { useOrderMargin } from './use-order-margin';
import * as Schema from '@vegaprotocol/types';
import type { Market, MarketData } from '@vegaprotocol/market-list';

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
  openVolume: '1',
  balance: '100000',
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
  const marketId = 'marketId';
  const args: Props = {
    order: {
      marketId,
      size: '2',
      side: Schema.Side.SIDE_BUY,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
      type: Schema.OrderType.TYPE_MARKET,
    },
    market: {
      id: marketId,
      decimalPlaces: 2,
      positionDecimalPlaces: 0,
      tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
    } as unknown as Market,
    marketData: {
      indicativePrice: '100',
      markPrice: '200',
    } as unknown as MarketData,
    partyId: 'partyId',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate margin correctly', () => {
    const { result } = renderHook(() => useOrderMargin(args));
    expect(result.current?.margin).toEqual('100000');
    expect((useQuery as jest.Mock).mock.calls[0][1].variables.size).toEqual(
      args.order.size
    );
  });

  it('should calculate fees correctly', () => {
    const { result } = renderHook(() => useOrderMargin(args));
    expect(result.current?.totalFees).toEqual('300000');
  });

  it('should not subtract initialMargin if there is no position', () => {
    mockMarketPositions = null;
    const { result } = renderHook(() => useOrderMargin(args));
    expect(result.current?.margin).toEqual('200000');

    expect((useQuery as jest.Mock).mock.calls[0][1].variables.size).toEqual(
      args.order.size
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
    const { result } = renderHook(() => useOrderMargin(args));
    expect(result.current).toEqual(null);

    const calledSize = new BigNumber(mockMarketPositions?.openVolume || 0)
      .plus(args.order.size)
      .toString();
    expect((useQuery as jest.Mock).mock.calls[0][1].variables.size).toEqual(
      calledSize
    );
  });
});
