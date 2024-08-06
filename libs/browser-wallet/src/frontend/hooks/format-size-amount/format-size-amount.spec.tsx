import { renderHook } from '@testing-library/react';

import { HALF_MAX_POSITION_SIZE } from '@/lib/transactions';
import { useMarketsStore } from '@/stores/markets-store';
import { mockStore } from '@/test-helpers/mock-store';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { useFormatSizeAmount } from './format-size-amount';

jest.mock('@/stores/markets-store');

describe('useFormatSizeAmount', () => {
  it('throw error if market decimals are not defined', () => {
    silenceErrors();
    mockStore(useMarketsStore, {
      getMarketById: () => ({
        decimalPlaces: undefined,
      }),
    });
    expect(() => renderHook(() => useFormatSizeAmount('foo', '123'))).toThrow(
      'Could not find market or positionDecimals'
    );
  });

  it('throw error if market is not defined', () => {
    silenceErrors();
    mockStore(useMarketsStore, {
      getMarketById: () => {},
    });
    expect(() => renderHook(() => useFormatSizeAmount('foo', '123'))).toThrow(
      'Could not find market or positionDecimals'
    );
  });

  it('returns formatted amount', () => {
    mockStore(useMarketsStore, {
      getMarketById: () => ({
        positionDecimalPlaces: 12,
      }),
    });
    const { result } = renderHook(() => useFormatSizeAmount('foo', '123'));
    expect(result.current).toBe('0.000000000123');
  });

  it('allows positionDecimals to be 0', () => {
    mockStore(useMarketsStore, {
      getMarketById: () => ({
        positionDecimalPlaces: 0,
      }),
    });
    const { result } = renderHook(() => useFormatSizeAmount('foo', '123'));
    expect(result.current).toBe('123');
  });

  it('returns max when size is max safe integer', () => {
    mockStore(useMarketsStore, {
      getMarketById: () => ({
        positionDecimalPlaces: 12,
      }),
    });
    const { result } = renderHook(() =>
      useFormatSizeAmount('foo', HALF_MAX_POSITION_SIZE)
    );
    expect(result.current).toBe('Max');
  });

  it('returns undefined if loading', () => {
    mockStore(useMarketsStore, {
      loading: true,
      getMarketById: () => ({
        positionDecimalPlaces: 12,
      }),
    });
    const { result } = renderHook(() =>
      useFormatSizeAmount('foo', HALF_MAX_POSITION_SIZE)
    );
    expect(result.current).toBeUndefined();
  });

  it('returns undefined if no market is provided', () => {
    mockStore(useMarketsStore, {
      getMarketById: () => ({
        decimalPlaces: 12,
      }),
    });
    const { result } = renderHook(() => useFormatSizeAmount(undefined, '123'));
    expect(result.current).toBeUndefined();
  });

  it('returns undefined if no price is provided', () => {
    mockStore(useMarketsStore, {
      getMarketById: () => ({
        decimalPlaces: 12,
      }),
    });
    const { result } = renderHook(() => useFormatSizeAmount('foo'));
    expect(result.current).toBeUndefined();
  });
});
