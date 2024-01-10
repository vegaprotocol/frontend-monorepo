import { renderHook } from '@testing-library/react';
import { Intent } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import {
  formatWithAsset,
  sumLiquidityCommitted,
  getFeeLevels,
  calcDayVolume,
  getCandle24hAgo,
  getChange,
  EMPTY_VALUE,
  useCheckLiquidityStatus,
} from './liquidity-utils';

const CANDLES_1 = [
  { volume: '10', open: '11', close: '11' },
  { volume: '20', open: '12', close: '12' },
  { volume: '30', open: '13', close: '13' },
];
const CANDLES_2 = [
  { volume: '30', open: '23', close: '23' },
  { volume: '20', open: '12', close: '12' },
  { volume: '10', open: '21', close: '21' },
];

describe('formatWithAsset', () => {
  it('should return formatted string', () => {
    const result = formatWithAsset('103926176181', {
      decimals: 5,
      symbol: 'tEURO',
    });

    expect(result).toEqual('1,039,261.76181 tEURO');
  });
});

describe('sumLiquidityCommitted', () => {
  it('should return the total sum', () => {
    const provider1 = 10;
    const provider2 = 20;
    const provider3 = 30;
    const providers = [
      {
        commitmentAmount: `${provider1}`,
      },
      {
        commitmentAmount: `${provider2}`,
      },
      {
        commitmentAmount: `${provider3}`,
      },
    ];

    const result = sumLiquidityCommitted(providers);
    expect(result).toEqual(provider1 + provider2 + provider3);
  });
});

describe('getFeeLevels', () => {
  it('should return providers grouped by fees', () => {
    const result = getFeeLevels([
      {
        fee: '0.2',
        commitmentAmount: '10',
      },
      {
        fee: '0.1',
        commitmentAmount: '10',
      },
      {
        fee: '0.1',
        commitmentAmount: '20',
      },
    ]);
    expect(result).toEqual([
      { fee: '0.1', commitmentAmount: 30 },
      { fee: '0.2', commitmentAmount: 10 },
    ]);
  });
});

describe('calcDayVolume', () => {
  it('should return the volume', () => {
    const candles = CANDLES_1;
    const result = calcDayVolume(candles);

    expect(result).toEqual('60');
  });
});

describe('getCandle24hAgo', () => {
  it('should return the the candle', () => {
    const MARKET_ID = '123';
    const CANDLES = [
      { marketId: '456', candles: CANDLES_2 },
      { marketId: MARKET_ID, candles: CANDLES_1 },
    ];

    const result = getCandle24hAgo(MARKET_ID, CANDLES);

    expect(result).toEqual(CANDLES_1[0]);
  });
});

describe('getChange', () => {
  it('should return the change', () => {
    const lastClose = CANDLES_2[0].close;
    const result = getChange(CANDLES_1, lastClose);

    expect(result).toEqual('109.091%');
  });

  it('should return the change if no close', () => {
    const result = getChange(CANDLES_1);

    expect(result).toEqual('18.182%');
  });

  it('should return empty if no candles', () => {
    const result = getChange([null]);

    expect(result).toEqual(EMPTY_VALUE);
  });
});

describe('useCheckLiquidityStatus', () => {
  it('should return red if liquidity is not enough', () => {
    const { result } = renderHook(() =>
      useCheckLiquidityStatus({
        suppliedStake: '60',
        targetStake: '100',
      })
    );

    expect(result.current).toEqual({
      status: Intent.Danger,
      percentage: new BigNumber('60'),
    });
  });

  it('should return green if liquidity is enough', () => {
    const { result } = renderHook(() =>
      useCheckLiquidityStatus({
        suppliedStake: '101',
        targetStake: '100',
      })
    );

    expect(result.current).toEqual({
      status: Intent.Success,
      percentage: new BigNumber('101'),
    });
  });
});
