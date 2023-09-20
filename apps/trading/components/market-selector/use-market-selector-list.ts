import { useMemo } from 'react';
import orderBy from 'lodash/orderBy';
import {
  calcTradedFactor,
  getAsset,
  useMarketList,
} from '@vegaprotocol/markets';
import { priceChangePercentage } from '@vegaprotocol/utils';
import type { Filter } from '../../components/market-selector/market-selector';
import { Sort } from './sort-dropdown';
import { Product } from './product-selector';
import { isMarketActive } from '../../lib/utils';

export const useMarketSelectorList = ({
  product,
  assets,
  sort,
  searchTerm,
}: Filter) => {
  const { data, loading, error, reload } = useMarketList();

  const markets = useMemo(() => {
    if (!data?.length) return [];
    const markets = data
      // only active
      .filter((m) => isMarketActive(m.state))
      // only selected product type
      .filter((m) => {
        if (
          product === Product.All ||
          m.tradableInstrument.instrument.product.__typename === product
        ) {
          return true;
        }
        return false;
      })
      .filter((m) => {
        if (assets.length === 0) return true;
        const asset = getAsset(m);
        return assets.includes(asset.id);
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

    if (sort === Sort.TopTraded) {
      return orderBy(markets, [(m) => calcTradedFactor(m)], ['desc']);
    }

    return markets;
  }, [data, product, searchTerm, assets, sort]);

  return { markets, data, loading, error, reload };
};
