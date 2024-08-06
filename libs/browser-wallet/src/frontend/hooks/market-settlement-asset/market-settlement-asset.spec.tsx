import { renderHook } from '@testing-library/react';

import { AssetsStore, useAssetsStore } from '@/stores/assets-store';
import { MarketsStore, useMarketsStore } from '@/stores/markets-store';
import { DeepPartial, mockStore } from '@/test-helpers/mock-store';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { useMarketPriceAsset } from './market-settlement-asset';

jest.mock('@/stores/assets-store');
jest.mock('@/stores/markets-store');

const mockStores = (
  marketStore: DeepPartial<MarketsStore>,
  assetStore: DeepPartial<AssetsStore>
) => {
  mockStore(useMarketsStore, marketStore);
  mockStore(useAssetsStore, assetStore);
};

describe('useMarketPriceAsset', () => {
  it('returns nothing if markets are loading', () => {
    mockStores({ loading: true }, {});
    const { result } = renderHook(() => useMarketPriceAsset('someMarketId'));
    expect(result.current).toBeUndefined();
  });
  it('returns nothing if assets are loading', () => {
    mockStores({ getMarketById: jest.fn() }, { loading: true });
    const { result } = renderHook(() => useMarketPriceAsset('someMarketId'));
    expect(result.current).toBeUndefined();
  });
  it('returns nothing if marketId is undefined', () => {
    mockStores({}, {});
    const { result } = renderHook(() => useMarketPriceAsset());
    expect(result.current).toBeUndefined();
  });
  it('returns settlement asset if settlement asset can be found', () => {
    mockStores(
      {
        getMarketById: () => ({
          tradableInstrument: {
            instrument: { future: { settlementAsset: 'someAssetId' } },
          },
        }),
      },
      {
        getAssetById: () => ({
          id: 'someAssetId',
        }),
      }
    );
    const { result } = renderHook(() => useMarketPriceAsset('someMarketId'));
    expect(result.current).toEqual({
      id: 'someAssetId',
    });
  });
  it('throws error if market has no settlement asset', () => {
    silenceErrors();
    mockStores(
      {
        getMarketById: () => ({
          tradableInstrument: {
            instrument: { future: { settlementAsset: undefined } },
          },
        }),
      },
      {}
    );
    expect(() =>
      renderHook(() => useMarketPriceAsset('someMarketId'))
    ).toThrow();
  });
});
