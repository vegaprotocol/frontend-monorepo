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
import { useCallback, useState, useMemo, useRef } from 'react';
import { FixedSizeList } from 'react-window';
import { useMarketSelectorList } from './use-market-selector-list';
import type { ProductType } from './product-selector';
import { Product, ProductSelector } from './product-selector';
import { AssetDropdown } from './asset-dropdown';
import type { SortType } from './sort-dropdown';
import { Sort, SortDropdown } from './sort-dropdown';
import { MarketSelectorItem } from './market-selector-item';
import classNames from 'classnames';

export type Filter = {
  searchTerm: string;
  product: ProductType | 'All';
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
  onSelect: (marketId: string) => void;
}) => {
  const [filter, setFilter] = useState<Filter>({
    searchTerm: '',
    product: 'All',
    sort: Sort.None,
    assets: [],
  });

  const { markets, data, loading, error } = useMarketSelectorList(filter);

  return (
    <div data-testid="market-selector">
      <div className="pt-2 px-2 mb-2">
        <ProductSelector
          product={filter.product}
          onSelect={(product) => {
            setFilter((curr) => ({ ...curr, product }));
          }}
        />
        <div className="text-sm grid grid-cols-[2fr_1fr_1fr] gap-1 ">
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
              prependElement={<VegaIcon name={VegaIconNames.SEARCH} />}
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
  onSelect: (marketId: string) => void;
  noItems: string;
}) => {
  const itemSize = 45;
  const listRef = useRef<HTMLDivElement | null>(null);
  const rect = listRef.current?.getBoundingClientRect();
  // allow virtualized list to grow until it runs out of space
  const computedHeight = rect
    ? Math.min(data.length * itemSize, window.innerHeight - rect.y)
    : 400;
  const height = Math.max(computedHeight, 45);

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <TinyScroll>
      <div
        className={classNames(
          'flex gap-2',
          'bg-vega-clight-700 dark:bg-vega-cdark-700',
          'p-2 mx-2 border-b border-default text-xs text-secondary'
        )}
      >
        <div className="w-2/5" role="columnheader">
          {t('Name')}
        </div>
        <div className="w-1/5" role="columnheader">
          {t('Price')}
        </div>
        <div className="w-1/5 text-right" role="columnheader">
          {t('24h volume')}
        </div>
        <div className="w-1/5" role="columnheader" />
      </div>
      <div ref={listRef}>
        <List
          data={data}
          loading={loading}
          height={height}
          itemSize={itemSize}
          currentMarketId={currentMarketId}
          onSelect={onSelect}
          noItems={noItems}
        />
      </div>
    </TinyScroll>
  );
};

interface ListItemData {
  data: MarketMaybeWithDataAndCandles[];
  onSelect: (marketId: string) => void;
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
  height,
  itemSize,
  onSelect,
  noItems,
  currentMarketId,
}: ListItemData & {
  loading: boolean;
  height: number;
  itemSize: number;
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
      <div style={{ height }}>
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div
        style={{ height }}
        className="flex items-center"
        data-testid="no-items"
      >
        <div className="mx-4 my-2 text-sm">{noItems}</div>
      </div>
    );
  }

  return (
    <FixedSizeList
      className="vega-scrollbar"
      itemCount={data.length}
      itemData={itemData}
      itemSize={itemSize}
      itemKey={itemKey}
      width="100%"
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
