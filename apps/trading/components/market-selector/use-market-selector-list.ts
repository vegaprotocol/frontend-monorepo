import { useMemo } from 'react';
import compact from 'lodash/compact';
import orderBy from 'lodash/orderBy';
import { priceChangePercentage } from '@vegaprotocol/utils';
import type { Filter } from '../../components/market-selector/market-selector';
import { Sort } from './sort-dropdown';
import { Product } from './product-selector';
import { isMarketActive } from '../../lib/utils';
import {
  useMarkets,
  getAsset,
  calcTradedFactor,
} from '../../lib/hooks/use-markets';

export const useMarketSelectorList = ({
  product,
  assets,
  sort,
  searchTerm,
}: Filter) => {
  const { data, isLoading: loading, error } = useMarkets();

  const markets = useMemo(() => {
    const d = Array.from(data?.values() || []);

    if (!d.length) return [];

    const markets = d
      // show only active markets, using m.data.marketState as this will be
      // data that will get refreshed when calling reload
      .filter((m) => {
        if (!m.data) return false;
        return isMarketActive(m.data.marketState);
      })
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
            if (!m.candlesConnection?.edges?.length) return 0;
            const candleData = compact(m.candlesConnection.edges)
              .map((e) => e.node)
              .filter((c) => c.close !== '')
              .map((c) => c.close);
            return Number(priceChangePercentage(candleData));
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

  return { markets, data, loading, error };
};
