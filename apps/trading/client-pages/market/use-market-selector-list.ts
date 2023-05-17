import { useMemo } from 'react';
import orderBy from 'lodash/orderBy';
import { MarketState } from '@vegaprotocol/types';
import { useMarketList } from '@vegaprotocol/markets';
import { priceChangePercentage } from '@vegaprotocol/utils';
import type { Filter } from './market-selector';
import { Sort } from './sort-dropdown';

export const useMarketSelectorList = ({
  product,
  assets,
  sort,
  searchTerm,
}: Filter) => {
  const { data, loading, error } = useMarketList();

  const markets = useMemo(() => {
    if (!data?.length) return [];
    const markets = data
      // only active
      .filter((m) => {
        return [MarketState.STATE_ACTIVE, MarketState.STATE_SUSPENDED].includes(
          m.state
        );
      })
      // only selected product type
      .filter((m) => {
        if (m.tradableInstrument.instrument.product.__typename === product) {
          return true;
        }
        return false;
      })
      .filter((m) => {
        if (assets.length === 0) return true;
        return assets.includes(
          m.tradableInstrument.instrument.product.settlementAsset.id
        );
      })
      // filter based on search term
      .filter((m) => {
        const code = m.tradableInstrument.instrument.code.toLowerCase();
        const name = m.tradableInstrument.instrument.name.toLowerCase();
        if (
          code.includes(searchTerm.toLowerCase()) ||
          name.includes(searchTerm.toLowerCase())
        ) {
          return true;
        }
        return false;
      });

    if (sort === Sort.None) {
      return orderBy(markets, ['tradableInstrument.instrument.code'], ['asc']);
    }

    if (sort === Sort.Gained || sort === Sort.Lost) {
      const dir = sort === Sort.Gained ? 'desc' : 'asc';
      return orderBy(
        markets,
        [
          (m) => {
            if (!m.candles?.length) return 0;
            return Number(priceChangePercentage(m.candles.map((c) => c.close)));
          },
        ],
        [dir]
      );
    }

    if (sort === Sort.New) {
      return orderBy(
        markets,
        [(m) => new Date(m.marketTimestamps.open).getTime()],
        ['desc']
      );
    }

    return markets;
  }, [data, product, searchTerm, assets, sort]);

  return { markets, data, loading, error };
};
