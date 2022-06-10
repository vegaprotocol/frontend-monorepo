import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { FILTERS_QUERY } from '../components/simple-market-list/data-provider';
import type { MarketFilters } from '../components/simple-market-list/__generated__/MarketFilters';

const useMarketFiltersData = () => {
  const [assets, setAssets] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [assetsPerProduct, setAssetsPerProduct] = useState<
    Record<string, string[]>
  >({});
  const { data } = useQuery<MarketFilters>(FILTERS_QUERY, {
    pollInterval: 5000,
  });
  useEffect(() => {
    const localProducts = new Set<string>();
    const localAssets = new Set<string>();
    const localAssetPerProduct: Record<string, Set<string>> = {};
    data?.markets?.forEach((item) => {
      const product = item.tradableInstrument.instrument.product.__typename;
      const asset =
        item.tradableInstrument.instrument.product.settlementAsset.symbol;
      if (!(product in localAssetPerProduct)) {
        localAssetPerProduct[product] = new Set<string>();
      }
      localAssetPerProduct[product].add(asset);
      localProducts.add(product);
      localAssets.add(asset);
    });
    setAssets([...localAssets]);
    setProducts([...localProducts]);
    setAssetsPerProduct(
      Object.entries(localAssetPerProduct).reduce(
        (agg: Record<string, string[]>, entry) => {
          agg[entry[0]] = [...entry[1]];
          return agg;
        },
        {}
      )
    );
  }, [data]);
  return { assets, products, assetsPerProduct };
};

export default useMarketFiltersData;
