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
import { FixedSizeList } from 'react-window';
import { useMarketSelectorList } from '../../client-pages/market/use-market-selector-list';
import type { ProductType } from '../../client-pages/market/product-selector';
import {
  Product,
  ProductSelector,
} from '../../client-pages/market/product-selector';
import { AssetDropdown } from '../../client-pages/market/asset-dropdown';
import type { SortType } from '../../client-pages/market/sort-dropdown';
import { Sort, SortDropdown } from '../../client-pages/market/sort-dropdown';
import { MarketSelectorItem } from './market-selector-item';
import classNames from 'classnames';

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
    <div data-testid="market-selector">
      <div className="pt-2 px-2 mb-2 w-[320px] lg:w-[584px]">
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
              appendElement={
                filter.searchTerm.length ? (
                  <button
                    onClick={() =>
                      setFilter((curr) => ({ ...curr, searchTerm: '' }))
                    }
                    className="text-secondary"
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
    <TinyScroll>
      <div
        className={classNames(
          'flex gap-2',
          'bg-vega-clight-700 dark:bg-vega-cdark-700',
          'p-2 mx-2 border-b border-default text-xs text-secondary'
        )}
      >
        <div className="w-1/4" role="columnheader">
          {t('Name')}
        </div>
        <div className="w-1/4" role="columnheader">
          {t('Price')}
        </div>
        <div className="w-1/4 text-right" role="columnheader">
          {t('24h volume')}
        </div>
        <div className="w-1/4" role="columnheader" />
      </div>
      <List
        data={data}
        loading={loading}
        height={400}
        currentMarketId={currentMarketId}
        onSelect={onSelect}
        noItems={noItems}
      />
    </TinyScroll>
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
  />
);

const List = ({
  data,
  loading,
  height,
  onSelect,
  noItems,
  currentMarketId,
}: ListItemData & {
  loading: boolean;
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
      <div style={{ height }}>
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div style={{ height }} data-testid="no-items">
        <div className="mx-4 my-2 text-sm">{noItems}</div>
      </div>
    );
  }

  return (
    <FixedSizeList
      className="vega-scrollbar"
      itemCount={data.length}
      itemData={itemData}
      itemSize={45}
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
