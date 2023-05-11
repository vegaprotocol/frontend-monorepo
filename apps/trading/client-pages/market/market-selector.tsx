import { t } from '@vegaprotocol/i18n';
import uniqBy from 'lodash/uniqBy';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/market-list';
import {
  useMarketDataUpdateSubscription,
  useMarketList,
} from '@vegaprotocol/market-list';
import { MarketState } from '@vegaprotocol/types';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuTrigger,
  Icon,
  Input,
  Sparkline,
  TinyScroll,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  addDecimalsFormatNumber,
  formatNumber,
  priceChangePercentage,
} from '@vegaprotocol/utils';
import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import classNames from 'classnames';

// Make sure these match the available __typename properties on product
const Product = {
  Spot: 'Spot',
  Future: 'Future',
  Perpetual: 'Perpetual',
} as const;

type ProductType = keyof typeof Product;

const ProductTypeMapping: {
  [key in ProductType]: string;
} = {
  [Product.Spot]: 'Spot',
  [Product.Future]: 'Futures',
  [Product.Perpetual]: 'Perpeturals',
};

export const MarketSelector = ({
  currentMarketId,
}: {
  currentMarketId?: string;
}) => {
  const { data, loading, error } = useMarketList();
  const [search, setSearch] = useState('');
  const [productType, setProductType] = useState<ProductType>(Product.Future);
  const [checkedAssets, setCheckedAssets] = useState<string[]>([]);

  const filteredList = useMemo(() => {
    if (!data?.length) return [];
    return (
      data
        // only active
        .filter((m) => {
          return [
            MarketState.STATE_ACTIVE,
            MarketState.STATE_SUSPENDED,
          ].includes(m.state);
        })
        // only selected product type
        .filter((m) => {
          if (
            m.tradableInstrument.instrument.product.__typename === productType
          ) {
            return true;
          }
          return false;
        })
        .filter((m) => {
          if (checkedAssets.length === 0) return true;
          return checkedAssets.includes(
            m.tradableInstrument.instrument.product.settlementAsset.id
          );
        })
        // filter based on search term
        .filter((m) => {
          const code = m.tradableInstrument.instrument.code.toLowerCase();
          if (code.includes(search)) {
            return true;
          }
          return false;
        })
    );
  }, [data, productType, search, checkedAssets]);

  return (
    <div className="grid grid-rows-[min-content_1fr_min-content] h-full">
      <div className="p-2">
        <div className="flex gap-3 mb-3">
          {Object.keys(Product).map((t) => {
            const classes = classNames('py-1 border-b-2', {
              'border-vega-yellow text-black dark:text-white':
                t === productType,
              'border-transparent text-vega-light-300 dark:text-vega-dark-300':
                t !== productType,
            });
            return (
              <button
                key={t}
                onClick={() => setProductType(t as ProductType)}
                className={classes}
              >
                {ProductTypeMapping[t as ProductType]}
              </button>
            );
          })}
        </div>
        <div className="text-sm flex gap-1 items-stretch">
          <input
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder={t('Search')}
            className="block border border-vega-light-200 dark:border-vega-dark-200 p-2 rounded bg-transparent w-48"
          />
          <AssetDropdown
            assets={uniqBy(
              data?.map(
                (d) => d.tradableInstrument.instrument.product.settlementAsset
              ),
              'id'
            )}
            checkedAssets={checkedAssets}
            onSelect={(id: string, checked) => {
              setCheckedAssets((curr) => {
                if (checked) {
                  if (curr.includes(id)) {
                    return curr;
                  } else {
                    return [...curr, id];
                  }
                } else {
                  if (curr.includes(id)) {
                    return curr.filter((x) => x !== id);
                  }
                }
                return curr;
              });
            }}
          />
          <SortDropdown />
        </div>
      </div>
      <div>
        <MarketList
          data={filteredList}
          loading={loading}
          error={error}
          searchTerm={search}
          currentMarketId={currentMarketId}
          noItems={
            productType === Product.Perpetual
              ? t('Perpetual markets coming soon.')
              : productType === Product.Spot
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
  noItems,
}: {
  data: MarketMaybeWithDataAndCandles[];
  error: Error | undefined;
  loading: boolean;
  searchTerm: string;
  currentMarketId?: string;
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
  noItems,
  currentMarketId,
}: {
  data: MarketMaybeWithDataAndCandles[];
  loading: boolean;
  width: number;
  height: number;
  noItems: string;
  currentMarketId?: string;
}) => {
  const row = ({ index, style }: { index: number; style: CSSProperties }) => {
    const market = data[index];

    const wrapperClasses = classNames(
      'block bg-vega-light-100 dark:bg-vega-dark-100 rounded-lg p-4',
      {
        'ring-1 ring-vega-light-300 dark:ring-vega-dark-300':
          currentMarketId === market.id,
      }
    );

    return (
      <div style={style} className="my-0.5 px-2">
        <Link to={`/markets/${market.id}`} className={wrapperClasses}>
          <div>{market.tradableInstrument.instrument.code}</div>
          <div
            title={market.tradableInstrument.instrument.name}
            className="text-sm text-vega-light-300 dark:text-vega-dark-300 text-ellipsis whitespace-nowrap overflow-hidden"
          >
            {market.tradableInstrument.instrument.name}
          </div>
          <MarketData market={market} />
        </Link>
      </div>
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
      <div style={{ width, height }}>
        <div className="mb-2 px-2">
          <div className="bg-vega-light-100 dark:bg-vega-dark-100 rounded-lg px-4 py-2">
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

const MarketData = ({ market }: { market: MarketMaybeWithDataAndCandles }) => {
  const { data } = useMarketDataUpdateSubscription({
    variables: {
      marketId: market.id,
    },
  });

  const marketData = data?.marketsData[0];

  return (
    <div className="flex flex-nowrap justify-between items-center mt-1">
      <div className="w-1/2">
        <div className="text-ellipsis whitespace-nowrap overflow-hidden">
          {marketData
            ? addDecimalsFormatNumber(
                marketData.markPrice,
                market.decimalPlaces
              )
            : '-'}
        </div>
        {market.candles && (
          <PriceChange candles={market.candles.map((c) => c.close)} />
        )}
      </div>
      <div className="w-1/2 max-w-[120px]">
        {market.candles ? (
          <Sparkline
            width={120}
            height={20}
            data={market.candles.filter(Boolean).map((c) => Number(c.close))}
          />
        ) : (
          '-'
        )}
      </div>
    </div>
  );
};

const PriceChange = ({ candles }: { candles: string[] }) => {
  const priceChange = candles ? priceChangePercentage(candles) : undefined;
  const priceChangeClasses = classNames('text-xs', {
    'text-vega-pink': priceChange && priceChange < 0,
    'text-vega-green': priceChange && priceChange > 0,
  });
  let prefix = '';
  if (priceChange && priceChange > 0) {
    prefix = '+';
  }
  const formattedChange = formatNumber(Number(priceChange), 2);
  return (
    <div className={priceChangeClasses}>
      {priceChange ? `${prefix}${formattedChange}%` : '-'}
    </div>
  );
};

const AssetDropdown = ({
  assets,
  checkedAssets,
  onSelect,
}: {
  assets: Array<{ id: string; symbol: string }> | undefined;
  checkedAssets: string[];
  onSelect: (id: string, checked: boolean) => void;
}) => {
  if (!assets?.length) {
    return null;
  }

  return (
    <DropdownMenu trigger={<DropdownMenuTrigger iconName="dollar" />}>
      <DropdownMenuContent>
        {assets?.map((a) => {
          return (
            <DropdownMenuCheckboxItem
              key={a.id}
              checked={checkedAssets.includes(a.id)}
              onCheckedChange={(checked) => {
                if (typeof checked === 'boolean') {
                  onSelect(a.id, checked);
                }
              }}
            >
              {a.symbol}
              <DropdownMenuItemIndicator />
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SortDropdown = () => {
  return (
    <DropdownMenu trigger={<DropdownMenuTrigger iconName="arrow-top-right" />}>
      <DropdownMenuContent>
        <DropdownMenuItem>{t('Top traded')}</DropdownMenuItem>
        <DropdownMenuItem>{t('Top gaining')}</DropdownMenuItem>
        <DropdownMenuItem>{t('Top losing')}</DropdownMenuItem>
        <DropdownMenuItem>{t('New markets')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
