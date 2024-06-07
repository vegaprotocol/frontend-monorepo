import { Sparkline, TinyScroll } from '@vegaprotocol/ui-toolkit';
import { OpenMarkets } from './open-markets';
import { Proposed } from './proposed';
import { Closed } from './closed';
import { useT } from '../../lib/use-t';
import { ErrorBoundary } from '../../components/error-boundary';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { Card } from '../../components/card';
import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  activeMarketsWithCandlesProvider,
  calcCandleVolumePrice,
  filterAndSortMarkets,
  type MarketMaybeWithCandles,
} from '@vegaprotocol/markets';
import { useYesterday } from '@vegaprotocol/react-helpers';
import { useEffect, useState } from 'react';
import { Interval } from '@vegaprotocol/types';
import { formatNumber } from '@vegaprotocol/utils';
import { TopMarketList } from './top-market-list';
import classNames from 'classnames';
import {
  useNewListings,
  useTopGainers,
  useTotalVolume24hCandles,
} from '../../lib/hooks/use-markets-stats';
import { useTotalValueLocked } from '../../lib/hooks/use-total-volume-locked';
import { useMarkets } from '../../lib/hooks/use-markets';

export const MarketsPage = () => {
  const t = useT();

  usePageTitle(t('Markets'));

  const topGainers = []; // useTopGainers(activeMarkets);
  const newListings = []; // useNewListings(activeMarkets);
  const totalVolume24hCandles: number[] = []; // useTotalVolume24hCandles(activeMarkets);

  // const totalVolumeSparkline = (
  //   <Sparkline width={80} height={20} data={totalVolume24hCandles} />
  // );
  // const { tvl, loading: tvlLoading, error: tvlError } = useTotalValueLocked();
  //
  // const totalVolume24h = activeMarkets?.reduce((acc, market) => {
  //   return (
  //     acc +
  //     Number(
  //       calcCandleVolumePrice(
  //         market.candles || [],
  //         market.decimalPlaces,
  //         market.positionDecimalPlaces
  //       )
  //     )
  //   );
  // }, 0);

  return (
    <ErrorBoundary feature="rewards">
      <TinyScroll className="p-2">
        {/* <div className="grid auto-rows-min grid-cols-3 lg:grid-cols-5 xl:grid-cols-3 gap-3 p-3 xxl:px-[5.5rem]">
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
        </div> */}
        <MarketTables />
      </TinyScroll>
    </ErrorBoundary>
  );
};

export const MarketTables = () => {
  const t = useT();
  const [activeTab, setActiveTab] = useState('open-markets');

  const marketTabs: {
    [key: string]: { id: string; name: string };
  } = {
    open: {
      id: 'open-markets',
      name: t('Open'),
    },
    proposed: {
      id: 'proposed-markets',
      name: t('Proposed'),
    },
    closed: {
      id: 'closed-markets',
      name: t('Closed'),
    },
  };

  return (
    <div className="pt-0.5 pb-3 px-1.5 xxl:px-[5.5rem]">
      <div className="flex gap-2">
        {Object.keys(marketTabs).map((key: string) => (
          <button
            key={key}
            className={classNames(
              'border border-default rounded-lg px-3 py-1.5 my-1 text-sm',
              {
                'dark:bg-vega-cdark-800 bg-vega-clight-800':
                  activeTab === marketTabs[key].id,
                'text-muted': activeTab !== marketTabs[key].id,
              }
            )}
            id={marketTabs[key].id}
            onClick={() => setActiveTab(marketTabs[key].id)}
          >
            {marketTabs[key].name}
          </button>
        ))}
      </div>

      <div className="h-full my-1 border rounded border-default">
        {activeTab === 'open-markets' && (
          <ErrorBoundary feature="markets-open">
            <OpenMarkets />
          </ErrorBoundary>
        )}
        {activeTab === 'proposed-markets' && (
          <ErrorBoundary feature="markets-proposed">
            <Proposed />
          </ErrorBoundary>
        )}
        {activeTab === 'closed-markets' && (
          <ErrorBoundary feature="markets-closed">
            <Closed />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};
