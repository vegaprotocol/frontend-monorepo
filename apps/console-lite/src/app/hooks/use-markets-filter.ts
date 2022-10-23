import type { Market } from '@vegaprotocol/market-list';
import { useEffect, useState } from 'react';

export const useMarketFilters = (data: Market[]) => {
  const [products, setProducts] = useState<string[]>([]);
  const [assetsPerProduct, setAssetsPerProduct] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    const localProducts = new Set<string>();
    const localAssetPerProduct: Record<string, Set<string>> = {};
    data?.forEach((item) => {
      const product = item.tradableInstrument.instrument.product.__typename;
      const asset =
        item.tradableInstrument.instrument.product.settlementAsset.symbol;
      if (!product) {
        return;
      }
      if (!(product in localAssetPerProduct)) {
        localAssetPerProduct[product] = new Set<string>();
      }
      localAssetPerProduct[product].add(asset);
      localProducts.add(product);
    });
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
  return { products, assetsPerProduct };
};
