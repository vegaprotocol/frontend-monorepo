import { renderHook } from '@testing-library/react';
import { useEstimateFees } from './use-estimate-fees';
import { Side, OrderTimeInForce, OrderType } from '@vegaprotocol/types';

import type { EstimateFeesQuery } from './__generated__/EstimateOrder';

const data: EstimateFeesQuery = {
  estimateFees: {
    totalFeeAmount: '12',
    fees: {
      infrastructureFee: '2',
      liquidityFee: '4',
      makerFee: '6',
    },
  },
};

const mockUseEstimateFeesQuery = jest.fn((...args) => ({
  data,
}));

jest.mock('./__generated__/EstimateOrder', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useEstimateFeesQuery: jest.fn((...args) => mockUseEstimateFeesQuery(...args)),
}));

jest.mock('@vegaprotocol/wallet', () => ({
  useVegaWallet: () => ({ pubKey: 'pubKey' }),
}));

describe('useEstimateFees', () => {
  it('returns 0 as estimated values if order is postOnly', () => {
    const { result } = renderHook(() =>
      useEstimateFees({
        marketId: 'marketId',
        side: Side.SIDE_BUY,
        size: '1',
        price: '1',
        timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
        type: OrderType.TYPE_LIMIT,
        postOnly: true,
      })
    );
    expect(result.current).toEqual({
      totalFeeAmount: '0',
      fees: {
        infrastructureFee: '0',
        liquidityFee: '0',
        makerFee: '0',
      },
    });
    expect(mockUseEstimateFeesQuery.mock.lastCall?.[0].skip).toBeTruthy();
  });

  it('divide values by 2 if market is in auction', () => {
    const { result } = renderHook(() =>
      useEstimateFees(
        {
          marketId: 'marketId',
          side: Side.SIDE_BUY,
          size: '1',
          price: '1',
          timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
          type: OrderType.TYPE_LIMIT,
        },
        true
      )
    );
    expect(result.current).toEqual({
      totalFeeAmount: '6',
      fees: {
        infrastructureFee: '1',
        liquidityFee: '2',
        makerFee: '3',
      },
    });
  });
});
