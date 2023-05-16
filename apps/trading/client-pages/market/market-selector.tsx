import { t } from '@vegaprotocol/i18n';
import uniqBy from 'lodash/uniqBy';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/market-list';
import { TinyScroll, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useMarketSelectorList } from './use-market-selector-list';
import type { ProductType } from './product-selector';
import { Product, ProductSelector } from './product-selector';
import { AssetDropdown } from './asset-dropdown';
import type { SortType } from './sort-dropdown';
import { Sort, SortDropdown } from './sort-dropdown';
import { MarketSelectorItem } from './market-selector-item';

export type Filter = {
  searchTerm: string;
  product: ProductType;
  sort: SortType;
  assets: string[];
};

/**
 * Fetches market data and filters it given a set of filter properties
 * defined in Filter
 */
export const MarketSelector = ({
  currentMarketId,
  onSelect,
}: {
  currentMarketId?: string;
  onSelect?: (marketId: string) => void;
}) => {
  const [filter, setFilter] = useState<Filter>({
    searchTerm: '',
    product: Product.Future,
    sort: Sort.None,
    assets: [],
  });

  const { markets, data, loading, error } = useMarketSelectorList(filter);

  return (
    <div
      className="grid grid-rows-[min-content_1fr_min-content] h-full"
      data-testid="market-selector"
    >
      <div className="px-4 py-2">
        <ProductSelector
          product={filter.product}
          onSelect={(product) => {
            setFilter((curr) => ({ ...curr, product }));
          }}
        />
        <div className="text-sm flex gap-1 items-stretch">
          <input
            onChange={(e) =>
              setFilter((curr) => ({ ...curr, searchTerm: e.target.value }))
            }
            type="text"
            placeholder={t('Search')}
            className="flex-1 block border border-vega-light-300 dark:border-vega-dark-300 p-2 rounded bg-transparent w-48"
            data-testid="search-term"
          />
          <AssetDropdown
            assets={uniqBy(
              data?.map(
                (d) => d.tradableInstrument.instrument.product.settlementAsset
              ),
              'id'
            )}
            checkedAssets={filter.assets}
            onSelect={(id: string, checked) => {
              setFilter((curr) => {
                if (checked) {
                  if (curr.assets.includes(id)) {
                    return curr;
                  } else {
                    return { ...curr, assets: [...curr.assets, id] };
                  }
                } else {
                  if (curr.assets.includes(id)) {
                    return {
                      ...curr,
                      assets: curr.assets.filter((x) => x !== id),
                    };
                  }
                }
                return curr;
              });
            }}
          />
          <SortDropdown
            currentSort={filter.sort}
            onSelect={(sort) => {
              setFilter((curr) => {
                if (curr.sort === sort) {
                  return { ...curr, sort: Sort.None };
                }
                return {
                  ...curr,
                  sort,
                };
              });
            }}
          />
        </div>
      </div>
      <div data-testid="market-selector-list">
        <MarketList
          data={markets}
          loading={loading}
          error={error}
          searchTerm={filter.searchTerm}
          currentMarketId={currentMarketId}
          onSelect={onSelect}
          noItems={
            filter.product === Product.Perpetual
              ? t('Perpetual markets coming soon.')
              : filter.product === Product.Spot
              ? t('Spot markets coming soon.')
              : t('No markets')
          }
        />
      </div>
      <div className="px-4 py-2">
        <span className="inline-block border-b border-white">
          <Link to={'/markets/all'} className="flex items-center gap-x-2">
            {t('All markets')}
            <VegaIcon name={VegaIconNames.ARROW_RIGHT} />
          </Link>
        </span>
      </div>
    </div>
  );
};

const MarketList = ({
  data,
  error,
  loading,
  currentMarketId,
  onSelect,
  noItems,
}: {
  data: MarketMaybeWithDataAndCandles[];
  error: Error | undefined;
  loading: boolean;
  searchTerm: string;
  currentMarketId?: string;
  onSelect?: (marketId: string) => void;
  noItems: string;
}) => {
  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <AutoSizer>
      {({ width, height }) => (
        <TinyScroll>
          <List
            data={data}
            loading={loading}
            width={width}
            height={height}
            currentMarketId={currentMarketId}
            onSelect={onSelect}
            noItems={noItems}
          />
        </TinyScroll>
      )}
    </AutoSizer>
  );
};

const List = ({
  data,
  loading,
  width,
  height,
  onSelect,
  noItems,
  currentMarketId,
}: {
  data: MarketMaybeWithDataAndCandles[];
  loading: boolean;
  width: number;
  height: number;
  noItems: string;
  onSelect?: (marketId: string) => void;
  currentMarketId?: string;
}) => {
  const row = ({ index, style }: { index: number; style: CSSProperties }) => {
    const market = data[index];

    return (
      <MarketSelectorItem
        market={market}
        currentMarketId={currentMarketId}
        style={style}
        onSelect={onSelect}
      />
    );
  };

  if (!data || loading) {
    return (
      <div style={{ width, height }}>
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div style={{ width, height }} data-testid="no-items">
        <div className="mb-2 px-4">
          <div className="text-sm bg-vega-light-100 dark:bg-vega-dark-100 rounded-lg px-4 py-2">
            {noItems}
          </div>
        </div>
      </div>
    );
  }

  return (
    <FixedSizeList
      className="virtualized-list"
      itemCount={data.length}
      itemSize={130}
      width={width}
      height={height}
    >
      {row}
    </FixedSizeList>
  );
};

const Skeleton = () => {
  return (
    <div className="mb-2 px-2">
      <div className="bg-vega-light-100 dark:bg-vega-dark-100 rounded-lg p-4">
        <div className="w-full h-3 bg-white dark:bg-vega-dark-200 mb-2" />
        <div className="w-2/3 h-3 bg-vega-light-300 dark:bg-vega-dark-200" />
      </div>
    </div>
  );
};
