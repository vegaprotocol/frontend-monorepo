import { t } from '@vegaprotocol/i18n';
import uniqBy from 'lodash/uniqBy';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';
import {
  Input,
  TinyScroll,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import type { CSSProperties } from 'react';
import { useCallback, useState, useMemo } from 'react';
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
      <div className="px-4 pt-2 pb-4">
        <ProductSelector
          product={filter.product}
          onSelect={(product) => {
            setFilter((curr) => ({ ...curr, product }));
          }}
        />
        <div className="text-sm flex gap-1 items-stretch">
          <div className="flex-1">
            <Input
              onChange={(e) =>
                setFilter((curr) => ({ ...curr, searchTerm: e.target.value }))
              }
              value={filter.searchTerm}
              type="text"
              placeholder={t('Search')}
              data-testid="search-term"
              className="w-full"
              appendElement={
                filter.searchTerm.length ? (
                  <button
                    onClick={() =>
                      setFilter((curr) => ({ ...curr, searchTerm: '' }))
                    }
                    className="text-vega-light-200 dark:text-vega-dark-200"
                  >
                    <VegaIcon name={VegaIconNames.CROSS} />
                  </button>
                ) : (
                  <span />
                )
              }
            />
          </div>
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
            onReset={() => setFilter((curr) => ({ ...curr, assets: [] }))}
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
            onReset={() => setFilter((curr) => ({ ...curr, sort: Sort.None }))}
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
        <span className="inline-block border-b border-black dark:border-white">
          <Link
            to={'/markets/all'}
            data-testid="all-markets-link"
            className="flex items-center gap-x-2"
          >
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

interface ListItemData {
  data: MarketMaybeWithDataAndCandles[];
  onSelect?: (marketId: string) => void;
  currentMarketId?: string;
}

const ListItem = ({
  index,
  style,
  data,
}: {
  index: number;
  style: CSSProperties;
  data: ListItemData;
}) => (
  <MarketSelectorItem
    market={data.data[index]}
    currentMarketId={data.currentMarketId}
    style={style}
    onSelect={data.onSelect}
  />
);

const List = ({
  data,
  loading,
  width,
  height,
  onSelect,
  noItems,
  currentMarketId,
}: ListItemData & {
  loading: boolean;
  width: number;
  height: number;
  noItems: string;
}) => {
  const itemKey = useCallback(
    (index: number, data: ListItemData) => data.data[index].id,
    []
  );
  const itemData = useMemo(
    () => ({ data, onSelect, currentMarketId }),
    [data, onSelect, currentMarketId]
  );
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
      itemData={itemData}
      itemSize={130}
      itemKey={itemKey}
      width={width}
      height={height}
    >
      {ListItem}
    </FixedSizeList>
  );
};

const Skeleton = () => {
  return (
    <div className="mb-2 px-2">
      <div className="bg-vega-light-100 dark:bg-vega-dark-100 rounded-lg p-4">
        <div className="w-full h-3 bg-vega-light-200 dark:bg-vega-dark-200 mb-2" />
        <div className="w-2/3 h-3 bg-vega-light-200 dark:bg-vega-dark-200" />
      </div>
    </div>
  );
};
