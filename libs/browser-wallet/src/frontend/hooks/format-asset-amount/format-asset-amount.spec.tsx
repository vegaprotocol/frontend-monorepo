import { renderHook } from '@testing-library/react';

import { useAssetsStore } from '@/stores/assets-store';
import { mockStore } from '@/test-helpers/mock-store';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { useFormatAssetAmount } from './format-asset-amount';

jest.mock('@/stores/assets-store');

describe('useFormatAssetAmount', () => {
  it('throw error if asset symbol is not defined', () => {
    silenceErrors();
    mockStore(useAssetsStore, {
      getAssetById: () => ({
        details: {
          symbol: undefined,
          decimals: 18,
        },
      }),
    });
    expect(() => renderHook(() => useFormatAssetAmount('foo', '123'))).toThrow(
      'Could not find amount, decimals or symbol when trying to render transaction for asset foo'
    );
  });

  it('throw error if asset decimals is not defined', () => {
    silenceErrors();
    mockStore(useAssetsStore, {
      getAssetById: () => ({
        details: {
          symbol: 'SYMBOL',
          decimals: undefined,
        },
      }),
    });
    expect(() => renderHook(() => useFormatAssetAmount('foo', '123'))).toThrow(
      'Could not find amount, decimals or symbol when trying to render transaction for asset foo'
    );
  });

  it('returns undefined while loading', () => {
    mockStore(useAssetsStore, {
      loading: true,
      getAssetById: () => ({
        details: {
          symbol: 'SYMBOL',
          decimals: undefined,
        },
      }),
    });
    const { result } = renderHook(() => useFormatAssetAmount('foo', '123'));
    expect(result.current).toStrictEqual({
      formattedAmount: undefined,
      symbol: undefined,
    });
  });

  it('returns formatted amount and symbol', () => {
    mockStore(useAssetsStore, {
      getAssetById: () => ({
        details: {
          symbol: 'SYMBOL',
          decimals: 12,
        },
      }),
    });
    const { result } = renderHook(() => useFormatAssetAmount('foo', '123'));
    expect(result.current?.formattedAmount).toBe('0.000000000123');
    expect(result.current?.symbol).toBe('SYMBOL');
  });

  it('handles decimals as 0', () => {
    mockStore(useAssetsStore, {
      getAssetById: () => ({
        details: {
          symbol: 'SYMBOL',
          decimals: 0,
        },
      }),
    });
    const { result } = renderHook(() => useFormatAssetAmount('foo', '123'));
    expect(result.current?.formattedAmount).toBe('123');
    expect(result.current?.symbol).toBe('SYMBOL');
  });
});
