import type { Candle, MarketMaybeWithCandles } from '@vegaprotocol/markets';
import { useNewListings } from './use-markets-stats';

import { useTotalVolume24hCandles } from './use-markets-stats';

import { useTVL } from './use-markets-stats';
import { addDecimal } from '@vegaprotocol/utils';

jest.mock('@vegaprotocol/utils', () => ({
  addDecimal: jest
    .fn()
    .mockImplementation(
      (value: string, decimals: number) =>
        Number(value) * Math.pow(10, -decimals)
    ),
}));

describe('Market page stats', () => {
  describe('useTVL', () => {
    it('handles null input', () => {
      expect(useTVL(null)).toEqual(undefined);
    });

    it('calculates TVL correctly', () => {
      const markets = [
        {
          accountsConnection: {
            edges: [
              {
                node: {
                  type: 'ACCOUNT_TYPE_INSURANCE',
                  balance: '1000',
                  asset: { decimals: 2 },
                },
              },
              {
                node: {
                  type: 'ACCOUNT_TYPE_INSURANCE',
                  balance: '2000',
                  asset: { decimals: 2 },
                },
              },
            ],
          },
        },
      ] as MarketMaybeWithCandles[];
      expect(useTVL(markets)).toEqual(30);
    });
  });

  describe('useTotalVolume24hCandles', () => {
    it('returns empty array for each hour when input is null', () => {
      expect(useTotalVolume24hCandles(null)).toEqual([]);
    });

    it('returns empty array for each hour with empty market data', () => {
      expect(useTotalVolume24hCandles([])).toEqual([]);
    });

    it('calculates total volume correctly with valid data', () => {
      const markets = [
        {
          candles: new Array(24).fill(0).map(
            (_) =>
              ({
                notional: '100',
              } as Candle)
          ),
          decimalPlaces: 2,
          positionDecimalPlaces: 1,
        },
      ] as MarketMaybeWithCandles[];

      const expectedVolumes = Array(24).fill(addDecimal('100', 3));
      expect(useTotalVolume24hCandles(markets)).toEqual(expectedVolumes);
    });
  });

  describe('useNewListings', () => {
    it('handles null input', () => {
      expect(useNewListings(null)).toEqual([]);
    });

    it('returns empty for no markets', () => {
      expect(useNewListings([])).toEqual([]);
    });

    it('returns latest three markets by open time', () => {
      const markets = [
        { marketTimestamps: { open: '2021-01-01T00:00:00Z' } },
        { marketTimestamps: { open: '2022-01-01T00:00:00Z' } },
        { marketTimestamps: { open: '2023-01-01T00:00:00Z' } },
      ] as MarketMaybeWithCandles[];
      expect(useNewListings(markets)).toEqual([
        markets[2],
        markets[1],
        markets[0],
      ]);
    });
  });
});
