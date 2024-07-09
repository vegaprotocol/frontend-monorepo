import {
  MultiSelect,
  MultiSelectOption,
  Sparkline,
  TinyScroll,
  TradingInput,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { OpenMarkets } from './open-markets';
import { useT } from '../../lib/use-t';
import { ErrorBoundary } from '../../components/error-boundary';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { Card } from '../../components/card';
import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  CLOSED_MARKETS_STATES,
  OPEN_MARKETS_STATES,
  PROPOSED_MARKETS_STATES,
  calcCandleVolumePrice,
  isFuture,
  isPerpetual,
  isSpot,
  marketsWithCandlesProvider,
  retrieveAssets,
  type MarketMaybeWithCandles,
} from '@vegaprotocol/markets';
import { useYesterday } from '@vegaprotocol/react-helpers';
import { type ReactNode, useEffect } from 'react';
import {
  Interval,
  type MarketState as MarketStateType,
} from '@vegaprotocol/types';
import { formatNumber } from '@vegaprotocol/utils';
import { TopMarketList } from './top-market-list';
import classNames from 'classnames';
import {
  useNewListings,
  useTopGainers,
  useTotalVolume24hCandles,
} from '../../lib/hooks/use-markets-stats';
import { useTotalValueLocked } from '../../lib/hooks/use-total-volume-locked';
import { create } from 'zustand';
import uniq from 'lodash/uniq';
import trim from 'lodash/trim';
import flatten from 'lodash/flatten';
import compact from 'lodash/compact';
import uniqBy from 'lodash/uniqBy';
import orderBy from 'lodash/orderBy';
import intersection from 'lodash/intersection';
import { getChainName } from '@vegaprotocol/web3';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { Trans } from 'react-i18next';

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
  const { tvl, loading: tvlLoading, error: tvlError } = useTotalValueLocked();

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
    <ErrorBoundary feature="rewards">
      <TinyScroll>
        <div className="xl:container mx-auto flex flex-col gap-4 p-4">
          <div className="grid auto-rows-min grid-cols-3 lg:grid-cols-5 xl:grid-cols-3 gap-3">
            <div className="flex flex-col gap-2 col-span-full lg:col-span-1">
              <Card key="24h-vol" className="flex grow">
                <div className="flex flex-col h-full">
                  <h2 className="mb-3">{t('24h Volume')}</h2>
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
              <Card
                key="tvl"
                className="flex grow"
                loading={tvlLoading || tvl.isNaN() || !!tvlError}
                title={t('TVL')}
              >
                <div className="flex flex-col h-full">
                  {tvl && (
                    <span className="text-xl">${formatNumber(tvl, 2)}</span>
                  )}
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
          <MarketTables
            markets={allMarkets}
            marketAssets={marketAssets}
            error={error}
          />
        </div>
      </TinyScroll>
    </ErrorBoundary>
  );
};

type MarketType = 'FUTR' | 'PERP' | 'SPOT';
type MarketState = 'OPEN' | 'PROPOSED' | 'CLOSED';

type Filters = {
  marketTypes: MarketType[];
  marketStates: MarketState[];
  assets: string[];
  searchTerm: string | undefined;
};
type Actions = {
  setMarketTypes: (marketTypes: MarketType[]) => void;
  setMarketStates: (marketSates: MarketState[]) => void;
  setAssets: (assets: string[]) => void;
  setSearchTerm: (searchTerm: string) => void;
  reset: () => void;
};

type MarketPageFiltersStore = Filters & Actions;

const DEFAULT_FILTERS: Filters = {
  marketTypes: [],
  marketStates: ['OPEN'],
  assets: [],
  searchTerm: '',
};

const useMarketPageFilters = create<MarketPageFiltersStore>()((set) => ({
  ...DEFAULT_FILTERS,
  setMarketTypes: (marketTypes) => set({ marketTypes }),
  setMarketStates: (marketStates) => set({ marketStates }),
  setAssets: (assets) => set({ assets }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  reset: () => set(DEFAULT_FILTERS),
}));

const filter = (
  markets: MarketMaybeWithCandles[],
  { marketTypes, marketStates, assets, searchTerm }: Filters
) => {
  let filteredMarkets = markets;
  // filter by market type
  if (marketTypes.length > 0) {
    filteredMarkets = filteredMarkets.filter((m) => {
      let marketType: MarketType | undefined = undefined;
      const product = m?.tradableInstrument?.instrument?.product;
      if (product) {
        if (isFuture(product)) marketType = 'FUTR';
        if (isPerpetual(product)) marketType = 'PERP';
        if (isSpot(product)) marketType = 'SPOT';
      }
      return marketType && marketTypes.includes(marketType);
    });
  }

  // filter by state
  filteredMarkets = filteredMarkets.filter((m) => {
    let states: MarketStateType[] = [];
    if (marketStates.includes('OPEN')) {
      states = [...states, ...OPEN_MARKETS_STATES];
    }
    if (marketStates.includes('CLOSED')) {
      states = [...states, ...CLOSED_MARKETS_STATES];
    }
    if (marketStates.includes('PROPOSED')) {
      states = [...states, ...PROPOSED_MARKETS_STATES];
    }

    const marketState = m.data?.marketState;
    return marketState && states.includes(marketState);
  });

  // filter by asset
  if (assets.length > 0) {
    filteredMarkets = filteredMarkets.filter((m) => {
      const product = m.tradableInstrument?.instrument?.product;
      if (product) {
        const marketAssets = retrieveAssets(product).map((a) => a.id);
        return intersection(assets, marketAssets).length > 0;
      }
    });
  }

  // filter by name or code
  if (searchTerm && searchTerm.length > 0) {
    filteredMarkets = filteredMarkets.filter((m) => {
      const name = m.tradableInstrument.instrument.name;
      const code = m.tradableInstrument.instrument.code;
      const re = new RegExp(searchTerm, 'ig');
      return re.test(name) || re.test(code);
    });
  }

  return filteredMarkets;
};

export const MarketTables = ({
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
  } = useMarketPageFilters((state) => ({
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

  const isMarketTypeSelected = (marketType: MarketType) =>
    marketTypes.includes(marketType);

  const marketTypeFilterOptions: Record<MarketType, string> = {
    PERP: t('Perpetuals'),
    FUTR: t('Futures'),
    SPOT: t('Spot'),
  };

  const marketStateFilterOptions: Record<MarketState, string> = {
    OPEN: t('Open'),
    CLOSED: t('Closed'),
    PROPOSED: t('Proposed'),
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

  const filteredMarkets = filter(markets || [], {
    marketTypes,
    marketStates,
    assets,
    searchTerm,
  });
  const defaultMarkets = filter(markets || [], DEFAULT_FILTERS);

  let filterSummary: ReactNode = undefined;
  if (filteredMarkets.length != defaultMarkets.length) {
    const diff = defaultMarkets.length - filteredMarkets.length;
    filterSummary = (
      <div className="p-2 text-center">
        <Trans
          i18nKey={
            diff > 0
              ? '{{count}} results excluded due to the applied filters. <0>Remove filters</0>.'
              : '{{count}} results included due to the applied filters. <0>Remove filters</0>.'
          }
          values={{ count: Math.abs(diff) }}
          components={[
            <button
              key="reset-filters"
              className="underline"
              onClick={() => {
                reset();
              }}
            >
              Remove filters
            </button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-baseline">
        {/** MARKET TYPE FILTER */}
        <div className="flex gap-2">
          <button
            key="all"
            id="all"
            className={classNames(
              'border border-default rounded-lg px-3 py-1.5 my-1 text-sm h-8',
              {
                'dark:bg-vega-cdark-800 bg-vega-clight-800':
                  marketTypes.length === 0 ||
                  marketTypes.length ===
                    Object.keys(marketTypeFilterOptions).length,
                'text-muted':
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
            const marketType = key as MarketType;
            return (
              <button
                key={marketType}
                className={classNames(
                  'border border-default rounded-lg px-3 py-1.5 my-1 text-sm',
                  {
                    'dark:bg-vega-cdark-800 bg-vega-clight-800':
                      isMarketTypeSelected(marketType),
                    'text-muted': !isMarketTypeSelected(marketType),
                  }
                )}
                id={marketType}
                onClick={() => {
                  let types = marketTypes;
                  if (isMarketTypeSelected(marketType)) {
                    types = types.filter((t) => t !== marketType);
                  } else {
                    types = uniq([...marketTypes, marketType]);
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
                const marketState = key as MarketState;
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
            <TradingInput
              prependIconName={VegaIconNames.SEARCH}
              prependIconDescription={t('Search by market')}
              placeholder={t('Search by market')}
              className="text-sm border !placeholder:text-secondary"
              onChange={(ev) => {
                const value = trim(ev.target.value);
                setSearchTerm(value);
              }}
              value={searchTerm}
              defaultValue={''}
            />
          </div>
        </div>
      </div>

      <div className="h-full my-1 border rounded border-default">
        <ErrorBoundary feature="all-markets">
          <OpenMarkets
            data={filteredMarkets}
            filterSummary={filterSummary}
            error={error}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};
