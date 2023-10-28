import { renderHook } from '@testing-library/react';
import { useEstimateFees } from './use-estimate-fees';
import { Side, OrderTimeInForce, OrderType } from '@vegaprotocol/types';

import type { EstimateFeesQuery } from './__generated__/EstimateOrder';

const data: EstimateFeesQuery = {
  epoch: {
    id: '2',
  },
  volumeDiscountStats: {
    edges: [
      {
        node: {
          atEpoch: 1,
          discountFactor: '0.1',
          runningVolume: '100',
        },
      },
    ],
  },
  referralSetStats: {
    edges: [
      {
        node: {
          atEpoch: 1,
          discountFactor: '0.2',
          referralSetRunningNotionalTakerVolume: '100',
        },
      },
    ],
  },
  estimateFees: {
    totalFeeAmount: '120',
    fees: {
      infrastructureFee: '20',
      infrastructureFeeReferralDiscount: '2',
      infrastructureFeeVolumeDiscount: '4',
      liquidityFee: '40',
      liquidityFeeReferralDiscount: '6',
      liquidityFeeVolumeDiscount: '8',
      makerFee: '60',
      makerFeeReferralDiscount: '10',
      makerFeeVolumeDiscount: '12',
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
      referralDiscountFactor: '0',
      volumeDiscountFactor: '0',
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
      totalFeeAmount: '60',
      fees: {
        infrastructureFee: '10',
        infrastructureFeeReferralDiscount: '1',
        infrastructureFeeVolumeDiscount: '2',
        liquidityFee: '20',
        liquidityFeeReferralDiscount: '3',
        liquidityFeeVolumeDiscount: '4',
        makerFee: '30',
        makerFeeReferralDiscount: '5',
        makerFeeVolumeDiscount: '6',
      },
      referralDiscountFactor: '0',
      volumeDiscountFactor: '0',
    });
  });

  it('returns 0 discounts is they are not at current epoch', () => {
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
    expect(result.current?.referralDiscountFactor).toEqual('0');
    expect(result.current?.volumeDiscountFactor).toEqual('0');
  });

  it('returns discounts', () => {
    data.epoch.id = '1';
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

    expect(result.current?.referralDiscountFactor).toEqual('0.2');
    expect(result.current?.volumeDiscountFactor).toEqual('0.1');
  });
});
