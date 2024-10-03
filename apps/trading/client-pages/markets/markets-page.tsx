import {
  MultiSelect,
  MultiSelectOption,
  Sparkline,
  Input,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { ErrorBoundary } from '../../components/error-boundary';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { Card } from '../../components/card';
import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  type MarketMaybeWithData,
  calcCandleVolumePrice,
  marketsWithCandlesProvider,
  retrieveAssets,
  type MarketMaybeWithCandles,
} from '@vegaprotocol/markets';
import { useYesterday } from '@vegaprotocol/react-helpers';
import { type ReactNode, useEffect } from 'react';
import { Interval } from '@vegaprotocol/types';
import { formatNumber } from '@vegaprotocol/utils';
import { TopMarketList } from './top-market-list';
import { cn } from '@vegaprotocol/ui-toolkit';
import {
  useNewListings,
  useTopGainers,
  useTotalVolume24hCandles,
} from '../../lib/hooks/use-markets-stats';
import { useTotalValueLocked } from '../../lib/hooks/use-total-volume-locked';
import uniq from 'lodash/uniq';
import trim from 'lodash/trim';
import flatten from 'lodash/flatten';
import compact from 'lodash/compact';
import uniqBy from 'lodash/uniqBy';
import orderBy from 'lodash/orderBy';
import { getChainName } from '@vegaprotocol/web3';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import {
  DEFAULT_FILTERS,
  type IMarketState,
  type IMarketType,
  MarketType,
  MarketState,
  filterMarkets,
  useMarketFiltersStore,
  filterMarket,
} from '../../lib/hooks/use-market-filters';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import MarketListTable from './market-list-table';
import type { CellClickedEvent, IRowNode } from 'ag-grid-community';
import { FilterSummary } from '../../components/market-selector/filter-summary';

const POLLING_TIME = 2000;

export const MarketsPage = () => {
  const t = useT();
  const yesterday = useYesterday();

  const {
    data: allMarkets,
    error,
    reload,
  } = useDataProvider({
    dataProvider: marketsWithCandlesProvider,
    variables: {
      since: new Date(yesterday).toISOString(),
      interval: Interval.INTERVAL_I1H,
    },
  });
  useEffect(() => {
    const interval = setInterval(() => {
      reload();
    }, POLLING_TIME);
    return () => {
      clearInterval(interval);
    };
  }, [reload]);

  usePageTitle(t('Markets'));

  const topGainers = useTopGainers(allMarkets);
  const newListings = useNewListings(allMarkets);
  const totalVolume24hCandles = useTotalVolume24hCandles(allMarkets);

  const totalVolumeSparkline = (
    <Sparkline width={80} height={20} data={totalVolume24hCandles} />
  );
  const { data: tvl, isLoading: tvlLoading } = useTotalValueLocked();

  const totalVolume24h = allMarkets?.reduce((acc, market) => {
    return (
      acc +
      Number(
        calcCandleVolumePrice(
          market.candles || [],
          market.decimalPlaces,
          market.positionDecimalPlaces
        )
      )
    );
  }, 0);

  const marketAssets = uniqBy(
    compact(
      flatten(
        allMarkets?.map((m) => {
          const product = m.tradableInstrument?.instrument?.product;
          if (product) {
            return retrieveAssets(product);
          }
        })
      )
    ),
    (a) => a.id
  );

  return (
    <ErrorBoundary feature="markets">
      <div className="grid auto-rows-min grid-cols-3 lg:grid-cols-5 xl:grid-cols-3 gap-3">
        <div className="flex flex-col gap-2 col-span-full lg:col-span-1">
          <Card key="24h-vol" className="flex grow">
            <div className="flex gap-2 flex-col h-full">
              <h2>{t('24h Volume')}</h2>
              <div className="flex items-center gap-2 justify-between flex-wrap grow">
                {totalVolume24h && (
                  <span className="text-xl">
                    ${formatNumber(totalVolume24h, 2)}
                  </span>
                )}
                <div>{totalVolumeSparkline}</div>
              </div>
            </div>
          </Card>
          <Card key="tvl" className="flex grow" loading={!tvl && tvlLoading}>
            <div className="flex gap-2 flex-col h-full">
              <h2>{t('TVL')}</h2>
              {tvl && <span className="text-xl">${formatNumber(tvl, 2)}</span>}
            </div>
          </Card>
        </div>
        <Card
          key="top-gainers"
          className="col-span-full lg:col-span-2 xl:col-span-1"
        >
          <div className="flex flex-col h-full gap-3">
            <h2 className="mb-3">Top gainers</h2>
            <TopMarketList markets={topGainers} />
          </div>
        </Card>
        <Card
          key="new-listings"
          className="col-span-full lg:col-span-2 xl:col-span-1"
        >
          <div className="flex flex-col h-full gap-3">
            <h2 className="mb-3">New listings</h2>
            <TopMarketList markets={newListings} />
          </div>
        </Card>
      </div>
      <MarketTable
        markets={allMarkets}
        marketAssets={marketAssets}
        error={error}
      />
    </ErrorBoundary>
  );
};

export const MarketTable = ({
  markets,
  marketAssets,
  error,
}: {
  markets: MarketMaybeWithCandles[] | null;
  marketAssets: AssetFieldsFragment[];
  error: Error | undefined;
}) => {
  const t = useT();

  const {
    marketTypes,
    marketStates,
    assets,
    searchTerm,
    setMarketTypes,
    setMarketStates,
    setAssets,
    setSearchTerm,
    reset,
  } = useMarketFiltersStore((state) => ({
    marketTypes: state.marketTypes,
    setMarketTypes: state.setMarketTypes,
    marketStates: state.marketStates,
    setMarketStates: state.setMarketStates,
    assets: state.assets,
    setAssets: state.setAssets,
    searchTerm: state.searchTerm,
    setSearchTerm: state.setSearchTerm,
    reset: state.reset,
  }));

  const isMarketTypeSelected = (marketType: IMarketType) =>
    marketTypes.includes(marketType);

  const marketTypeFilterOptions: Record<IMarketType, string> = {
    [MarketType.PERPETUAL]: t('Perpetuals'),
    [MarketType.FUTURE]: t('Futures'),
    [MarketType.SPOT]: t('Spot'),
  };

  const marketStateFilterOptions: Record<IMarketState, string> = {
    [MarketState.OPEN]: t('Open'),
    [MarketState.CLOSED]: t('Closed'),
    [MarketState.PROPOSED]: t('Proposed'),
  };
  let marketStateTrigger: string | undefined = undefined;
  if (marketStates.length > 0) {
    if (marketStates.length === 1) {
      marketStateTrigger = marketStateFilterOptions[marketStates[0]];
    }
    if (marketStates.length > 1) {
      marketStateTrigger = t('Status ({{count}})', {
        count: marketStates.length,
      });
    }
  }

  const assetFilterOptions = orderBy(marketAssets, (a) => a.symbol, 'asc');
  let assetTrigger: string | undefined = undefined;
  if (assets.length > 0) {
    if (assets.length === 1) {
      assetTrigger = marketAssets?.find((a) => a.id === assets[0])?.symbol;
    }
    if (assets.length > 1) {
      assetTrigger = t('Assets ({{count}})', { count: assets.length });
    }
  }

  const filteredMarkets = filterMarkets(markets || [], {
    marketTypes,
    marketStates,
    assets,
    searchTerm,
  });
  const defaultMarkets = filterMarkets(markets || [], DEFAULT_FILTERS);

  let filterSummary: ReactNode = undefined;
  if (filteredMarkets.length != defaultMarkets.length) {
    const diff = defaultMarkets.length - filteredMarkets.length;
    filterSummary = <FilterSummary diff={diff} resetFilters={reset} />;
  }

  const handleOnSelect = useMarketClickHandler();

  const isExternalFilterPresent = () => true;
  const doesExternalFilterPass = (
    rowData: IRowNode<MarketMaybeWithCandles>
  ) => {
    const market = rowData.data;
    if (!market) return false;
    return filterMarket(market, {
      marketTypes,
      marketStates,
      assets,
      searchTerm,
    });
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 justify-between items-baseline">
        {/** MARKET TYPE FILTER */}
        <div className="flex gap-2">
          <button
            key="all"
            id="all"
            className={cn(
              'border border-gs-300 dark:border-gs-700 rounded-lg px-3 py-1.5 text-sm h-8',
              {
                'bg-surface-1':
                  marketTypes.length === 0 ||
                  marketTypes.length ===
                    Object.keys(marketTypeFilterOptions).length,
                'text-surface-1-fg-muted':
                  marketTypes.length > 0 &&
                  marketTypes.length <
                    Object.keys(marketTypeFilterOptions).length,
              }
            )}
            onClick={() => {
              setMarketTypes([]);
            }}
          >
            {t('All')}
          </button>
          {Object.keys(marketTypeFilterOptions).map((key) => {
            const marketType = key as IMarketType;
            return (
              <button
                key={marketType}
                className={cn(
                  'border border-gs-300 dark:border-gs-700 rounded-lg px-3 py-1.5 text-sm',
                  {
                    'bg-surface-1': isMarketTypeSelected(marketType),
                    'text-surface-1-fg-muted':
                      !isMarketTypeSelected(marketType),
                  }
                )}
                id={marketType}
                onClick={() => {
                  let types = marketTypes;
                  if (isMarketTypeSelected(marketType)) {
                    types = [];
                  } else {
                    types = [marketType];
                  }
                  setMarketTypes(types);
                }}
              >
                {marketTypeFilterOptions[marketType]}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2">
          <div>
            <MultiSelect placeholder="Status" trigger={marketStateTrigger}>
              {Object.keys(marketStateFilterOptions).map((key) => {
                const marketState = key as IMarketState;
                const isChecked = marketStates.includes(marketState);
                return (
                  <MultiSelectOption
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setMarketStates(uniq([...marketStates, marketState]));
                      } else {
                        setMarketStates(
                          marketStates.filter((s) => s !== marketState)
                        );
                      }
                    }}
                    key={key}
                  >
                    {marketStateFilterOptions[marketState]}
                  </MultiSelectOption>
                );
              })}
            </MultiSelect>
          </div>
          <div>
            <MultiSelect placeholder="Assets" trigger={assetTrigger}>
              {assetFilterOptions.map((asset) => {
                const chainName = getChainName(
                  asset.source.__typename === 'ERC20'
                    ? Number(asset.source.chainId)
                    : undefined
                );
                const isChecked = assets.includes(asset.id);
                return (
                  <MultiSelectOption
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setAssets(uniq([...assets, asset.id]));
                      } else {
                        setAssets(assets.filter((a) => a !== asset.id));
                      }
                    }}
                    key={asset.id}
                  >
                    <span>{asset.symbol}</span>{' '}
                    <span className="text-xs">({chainName})</span>
                  </MultiSelectOption>
                );
              })}
            </MultiSelect>
          </div>
          {/** MARKET NAME FILTER */}
          <div className="w-2/3">
            <Input
              prependElement={<VegaIcon name={VegaIconNames.SEARCH} />}
              placeholder={t('Search by market')}
              className="text-sm"
              onChange={(ev) => {
                const value = trim(ev.target.value);
                setSearchTerm(value);
              }}
              value={searchTerm}
            />
          </div>
        </div>
      </div>
      <div className="h-full border rounded-lg overflow-hidden bg-surface-1/70">
        <ErrorBoundary feature="all-markets">
          <MarketListTable
            rowData={markets}
            filterSummary={filterSummary}
            onCellClicked={({
              data,
              column,
              event,
            }: CellClickedEvent<MarketMaybeWithData>) => {
              if (!data) return;

              // prevent navigating to the market page if any of the below cells are clicked
              // event.preventDefault or event.stopPropagation do not seem to apply for ag-grid
              const colId = column.getColId();

              if (
                [
                  'tradableInstrument.instrument.product.settlementAsset.symbol',
                  'market-actions',
                ].includes(colId)
              ) {
                return;
              }

              // @ts-ignore metaKey exists
              handleOnSelect(data.id, event ? event.metaKey : false);
            }}
            overlayNoRowsTemplate={error ? error.message : t('No markets')}
            suppressNoRowsOverlay
            isExternalFilterPresent={isExternalFilterPresent}
            doesExternalFilterPass={doesExternalFilterPass}
          />
        </ErrorBoundary>
      </div>
    </section>
  );
};
