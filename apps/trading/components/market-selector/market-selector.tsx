import compact from 'lodash/compact';
import uniqBy from 'lodash/uniqBy';
import {
  marketsWithCandlesProvider,
  retrieveAssets,
  type MarketMaybeWithDataAndCandles,
} from '@vegaprotocol/markets';
import {
  Input,
  TinyScroll,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useMemo, useRef, useEffect } from 'react';
import { FixedSizeList } from 'react-window';
import { ProductSelector } from './product-selector';
import { AssetDropdown } from './asset-dropdown';
import { SortDropdown } from './sort-dropdown';
import { MarketSelectorItem } from './market-selector-item';
import { cn } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import flatten from 'lodash/flatten';
import {
  MarketType,
  useMarketFiltersStore,
  filterMarkets,
  orderMarkets,
  DEFAULT_FILTERS,
} from '../../lib/hooks/use-market-filters';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { useYesterday } from '@vegaprotocol/react-helpers';
import { Interval } from '@vegaprotocol/types';
import uniq from 'lodash/uniq';
import { FilterSummary } from './filter-summary';

/**
 * Fetches market data and filters it given a set of filter properties
 * defined in Filter
 */
export const MarketSelector = ({
  currentMarketId,
  onSelect,
  marketIdsInScope,
  showFilters = true,
  className,
}: {
  currentMarketId?: string;
  onSelect: (marketId: string) => void;
  marketIdsInScope?: string[];
  showFilters?: boolean;
  className?: string;
}) => {
  const t = useT();

  const {
    marketTypes,
    marketStates,
    assets,
    searchTerm,
    sortOrder,
    setMarketTypes,
    setAssets,
    setSearchTerm,
    setSortOrder,
    reset,
  } = useMarketFiltersStore((state) => ({
    marketTypes: state.marketTypes,
    setMarketTypes: state.setMarketTypes,
    marketStates: state.marketStates,
    assets: state.assets,
    setAssets: state.setAssets,
    searchTerm: state.searchTerm,
    sortOrder: state.sortOrder,
    setSearchTerm: state.setSearchTerm,
    setSortOrder: state.setSortOrder,
    reset: state.reset,
  }));

  const yesterday = useYesterday();
  const { data, loading, error, reload } = useDataProvider({
    dataProvider: marketsWithCandlesProvider,
    variables: {
      since: new Date(yesterday).toISOString(),
      interval: Interval.INTERVAL_I1H,
    },
  });
  const markets = orderMarkets(
    filterMarkets(data || [], {
      marketTypes,
      marketStates,
      assets,
      searchTerm,
    }),
    sortOrder
  );
  const defaultMarkets = filterMarkets(data || [], DEFAULT_FILTERS);
  let filterSummary: ReactNode = undefined;
  if (markets.length != defaultMarkets.length) {
    const diff = defaultMarkets.length - markets.length;
    filterSummary = <FilterSummary diff={diff} resetFilters={reset} />;
  }

  useEffect(() => {
    reload();
  }, [reload]);

  const marketAssets = uniqBy(
    compact(
      flatten(
        data?.map((d) => {
          const product = d.tradableInstrument?.instrument?.product;
          if (product) return retrieveAssets(product);
        })
      )
    ),
    (a) => a.id
  ).map((a) => ({
    id: a.id,
    symbol: a.symbol,
    chainId:
      a.source.__typename === 'ERC20' ? Number(a.source.chainId) : undefined,
  }));

  const visibleMarkets = markets.filter((m) => {
    if (marketIdsInScope && marketIdsInScope.length > 0) {
      return marketIdsInScope.includes(m.id);
    }
    return true;
  });

  return (
    <div data-testid="market-selector" className={className}>
      {showFilters && (
        <div className="px-2 pt-2 mb-2">
          <ProductSelector
            marketTypes={marketTypes}
            onSelect={(marketType) => {
              if (marketType) {
                setMarketTypes([marketType]);
              } else {
                setMarketTypes([]);
              }
            }}
          />
          <div className="text-sm flex sm:grid grid-cols-[2fr_1fr_1fr] gap-1 ">
            <div className="flex-1">
              <Input
                onChange={(e) => {
                  const searchTerm = e.target.value;
                  setSearchTerm(searchTerm);
                }}
                value={searchTerm}
                type="text"
                placeholder={t('Search')}
                data-testid="search-term"
                prependElement={<VegaIcon name={VegaIconNames.SEARCH} />}
              />
            </div>
            <AssetDropdown
              assets={marketAssets}
              checkedAssets={assets}
              onSelect={(id: string, checked) => {
                if (checked) {
                  setAssets(uniq([...assets, id]));
                } else {
                  setAssets(assets.filter((a) => a !== id));
                }
              }}
            />
            <SortDropdown
              currentSort={sortOrder}
              onSelect={(sortOrder) => {
                setSortOrder(sortOrder);
              }}
            />
          </div>
        </div>
      )}
      <div data-testid="market-selector-list">
        <MarketList
          data={visibleMarkets}
          loading={loading && !data}
          error={error}
          currentMarketId={currentMarketId}
          onSelect={onSelect}
          noItems={
            marketTypes.includes(MarketType.PERPETUAL)
              ? t('No perpetual markets.')
              : marketTypes.includes(MarketType.SPOT)
              ? t('No spot markets.')
              : marketTypes.includes(MarketType.FUTURE)
              ? t('No future markets.')
              : t('No markets.')
          }
          filterSummary={filterSummary}
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
  filterSummary,
}: {
  data: MarketMaybeWithDataAndCandles[];
  error: Error | undefined;
  loading: boolean;
  currentMarketId?: string;
  onSelect: (marketId: string) => void;
  noItems: string;
  filterSummary: ReactNode;
}) => {
  const t = useT();
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
        className={cn(
          'grid grid-cols-6 sm:grid-cols-12 gap-2',
          'p-2 mx-2 border-b border-gs-300 dark:border-gs-700 text-xs text-surface-0-fg-muted'
        )}
      >
        <div className="col-span-4 sm:col-span-5" role="columnheader">
          {t('Name')}
        </div>
        <div
          className="col-span-2 sm:col-span-3 text-right"
          role="columnheader"
        >
          {t('Price')}
        </div>
        <div
          className="hidden col-span-2 sm:flex justify-end text-right"
          role="columnheader"
        >
          {t('24h volume')}
        </div>
        <div className="hidden sm:flex col-span-2" role="columnheader" />
      </div>
      {filterSummary ? (
        <div className="text-xs border-b border-gs-300 dark:border-gs-700">
          {filterSummary}
        </div>
      ) : null}
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
      className="vega-scrollbar mb-2"
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
    <div className="px-2 mb-2">
      <div className="p-4 rounded-lg bg-surface-2">
        <div className="w-full h-3 mb-2 bg-surface-3" />
        <div className="w-2/3 h-3 bg-surface-3" />
      </div>
    </div>
  );
};
