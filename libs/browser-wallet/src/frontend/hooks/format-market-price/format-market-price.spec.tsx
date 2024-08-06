import { renderHook } from '@testing-library/react';

import { useMarketsStore } from '@/stores/markets-store';
import { mockStore } from '@/test-helpers/mock-store';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { useFormatMarketPrice } from './format-market-price';

jest.mock('@/stores/markets-store');

describe('useFormatMarketPrice', () => {
  it('throw error if market decimals are not defined', () => {
    silenceErrors();
    mockStore(useMarketsStore, {
      getMarketById: () => ({
        decimalPlaces: undefined,
      }),
    });
    expect(() => renderHook(() => useFormatMarketPrice('foo', '123'))).toThrow(
      'Could not find market or decimalPlaces'
    );
  });

  it('throw error if market is not defined', () => {
    silenceErrors();
    mockStore(useMarketsStore, {
      getMarketById: () => {},
    });
    expect(() => renderHook(() => useFormatMarketPrice('foo', '123'))).toThrow(
      'Could not find market or decimalPlaces'
    );
  });

  it('returns formatted amount', () => {
    mockStore(useMarketsStore, {
      getMarketById: () => ({
        decimalPlaces: 12,
      }),
    });
    const { result } = renderHook(() => useFormatMarketPrice('foo', '123'));
    expect(result.current).toBe('0.000000000123');
  });

  it('returns undefined if loading', () => {
    mockStore(useMarketsStore, {
      loading: true,
      getMarketById: () => ({
        decimalPlaces: 12,
      }),
    });
    const { result } = renderHook(() => useFormatMarketPrice('foo', '123'));
    expect(result.current).toBeUndefined();
  });

  it('returns undefined if no market is provided', () => {
    mockStore(useMarketsStore, {
      getMarketById: () => ({
        decimalPlaces: 12,
      }),
    });
    const { result } = renderHook(() => useFormatMarketPrice(undefined, '123'));
    expect(result.current).toBeUndefined();
  });

  it('returns undefined if no price is provided', () => {
    mockStore(useMarketsStore, {
      getMarketById: () => ({
        decimalPlaces: 12,
      }),
    });
    const { result } = renderHook(() => useFormatMarketPrice('foo'));
    expect(result.current).toBeUndefined();
  });
});
