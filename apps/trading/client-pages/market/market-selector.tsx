import { t } from '@vegaprotocol/i18n';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/market-list';
import {
  useMarketDataUpdateSubscription,
  useMarketList,
} from '@vegaprotocol/market-list';
import {
  MarketState,
  MarketStateMapping,
  MarketTradingModeMapping,
} from '@vegaprotocol/types';
import { Input, Sparkline, TinyScroll } from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import classNames from 'classnames';

export const MarketSelector = ({
  currentMarketId,
}: {
  currentMarketId?: string;
}) => {
  const [search, setSearch] = useState('');

  return (
    <div className="grid grid-rows-[min-content_1fr_min-content] h-full">
      <div className="p-2">
        <Input
          placeholder={t('Search')}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div>
        <MarketList searchTerm={search} currentMarketId={currentMarketId} />
      </div>
      <div className="px-4 py-2">
        <Link to={'/markets/all'} className="underline">
          {t('All markets')}
        </Link>
      </div>
    </div>
  );
};

const MarketList = ({
  searchTerm,
  currentMarketId,
}: {
  searchTerm: string;
  currentMarketId?: string;
}) => {
  const { data, loading, error } = useMarketList();

  if (error) {
    return <div>{error.message}</div>;
  }

  const filteredList = data
    ? data
        .filter((m) => {
          return m.state === MarketState.STATE_ACTIVE;
        })
        // filter based on search term
        .filter((m) => {
          const code = m.tradableInstrument.instrument.code.toLowerCase();
          if (code.includes(searchTerm)) {
            return true;
          }
          return false;
        })
    : [];

  const row = ({ index, style }: { index: number; style: CSSProperties }) => {
    const market = filteredList[index];
    const wrapperClasses = classNames(
      'block bg-vega-light-100 dark:bg-vega-dark-100 rounded-lg p-4',
      {
        'ring-1 ring-vega-light-300 dark:ring-vega-dark-300':
          currentMarketId === market.id,
      }
    );
    return (
      <div style={style} className="mb-0.5 px-2">
        <Link to={`/markets/${market.id}`} className={wrapperClasses}>
          <div>{market.tradableInstrument.instrument.code}</div>
          <div
            title={market.tradableInstrument.instrument.name}
            className="text-sm text-vega-light-300 dark:text-vega-dark-300 text-ellipsis whitespace-nowrap overflow-hidden"
          >
            {market.tradableInstrument.instrument.name}
          </div>
          <div className="flex flex-nowrap justify-between items-center mt-1">
            <div className="w-1/2">
              <div className="text-ellipsis whitespace-nowrap overflow-hidden">
                {market.data
                  ? addDecimalsFormatNumber(
                      market.data.markPrice,
                      market.decimalPlaces
                    )
                  : '-'}
              </div>
              <div className="text-vega-pink text-xs">-1.02%</div>
            </div>
            <div className="w-1/2">
              {market.candles ? (
                <Sparkline
                  width={120}
                  height={20}
                  data={market.candles
                    .filter(Boolean)
                    .map((c) => Number(c.close))}
                />
              ) : (
                '-'
              )}
            </div>
          </div>
          {/* <MarketData market={market} /> */}
        </Link>
      </div>
    );
  };

  return (
    <AutoSizer>
      {({ width, height }) => (
        <TinyScroll>
          {!data || loading ? (
            <div style={{ width, height }}>
              <Skeleton />
              <Skeleton />
            </div>
          ) : (
            <FixedSizeList
              className="virtualized-list"
              itemCount={filteredList.length}
              itemSize={130}
              width={width}
              height={height}
            >
              {row}
            </FixedSizeList>
          )}
        </TinyScroll>
      )}
    </AutoSizer>
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
    <div className="text-xs">
      <div>
        {marketData ? MarketStateMapping[marketData.marketState] : '-'}
        {' | '}
        {marketData
          ? MarketTradingModeMapping[marketData.marketTradingMode]
          : '-'}
      </div>
      <div className="flex justify-between">
        <div>{t('Best bid price')}</div>
        <div>
          {marketData
            ? addDecimalsFormatNumber(
                marketData.bestBidPrice,
                market.decimalPlaces
              )
            : '-'}
        </div>
      </div>
      <div className="flex justify-between">
        <div>{t('Best bid volume')}</div>
        <div>
          {marketData
            ? addDecimalsFormatNumber(
                marketData.bestBidVolume,
                market.positionDecimalPlaces
              )
            : '-'}
        </div>
      </div>
    </div>
  );
};
