import { Sparkline, TinyScroll } from '@vegaprotocol/ui-toolkit';
import { OpenMarkets } from './open-markets';
import { Proposed } from './proposed';
import { Closed } from './closed';
import {
  DApp,
  TOKEN_NEW_MARKET_PROPOSAL,
  useLinks,
} from '@vegaprotocol/environment';
import { useT } from '../../lib/use-t';
import { ErrorBoundary } from '../../components/error-boundary';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { Card } from '../../components/card';
import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  activeMarketsWithCandlesProvider,
  calcCandleVolumePrice,
  type MarketMaybeWithCandles,
} from '@vegaprotocol/markets';
import { useYesterday } from '@vegaprotocol/react-helpers';
import { useEffect, useState } from 'react';
import { Interval } from '@vegaprotocol/types';
import { formatNumber } from '@vegaprotocol/utils';
import { TopMarketList } from './top-market-list';
import {
  useNewListings,
  useTotalVolumeLocked,
  useTopGainers,
  useTotalVolume24hCandles,
} from './use-markets-stats';
import classNames from 'classnames';

const POLLING_TIME = 2000;

export const MarketsPage = () => {
  const t = useT();
  const yesterday = useYesterday();
  const {
    data: activeMarkets,
    error,
    reload,
  } = useDataProvider({
    dataProvider: activeMarketsWithCandlesProvider,
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

  const topGainers = useTopGainers(activeMarkets);
  const newListings = useNewListings(activeMarkets);
  const totalVolume24hCandles = useTotalVolume24hCandles(activeMarkets);

  const totalVolumeSparkline = (
    <Sparkline width={80} height={20} data={totalVolume24hCandles} />
  );
  const tvl = useTotalVolumeLocked(activeMarkets);

  const totalVolume24h = activeMarkets?.reduce((acc, market) => {
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

  return (
    <ErrorBoundary feature="rewards">
      <TinyScroll className="p-2 max-h-full overflow-auto">
        <div className="grid auto-rows-min grid-cols-3 lg:grid-cols-5 xl:grid-cols-3 gap-3 p-3 xxl:px-[5.5rem]">
          <div className="flex flex-col gap-2 col-span-full lg:col-span-1">
            <Card key="24h-vol" className="grow">
              <div className="flex items-center gap-2 justify-between flex-wrap">
                <div className="flex flex-col">
                  {totalVolume24h && (
                    <span className="text-xl">
                      ${formatNumber(totalVolume24h, 2)}
                    </span>
                  )}
                  <span>{t('24h volume')}</span>
                </div>
                <div>{totalVolumeSparkline}</div>
              </div>
            </Card>
            <Card key="tvl" className="grow">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex flex-col">
                  {tvl && (
                    <span className="text-xl">${formatNumber(tvl, 2)}</span>
                  )}
                  <span>{t('TVL')}</span>
                </div>
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
        <MarketTables activeMarkets={activeMarkets} error={error} />
      </TinyScroll>
    </ErrorBoundary>
  );
};

export const MarketTables = ({
  activeMarkets,
  error,
}: {
  activeMarkets: MarketMaybeWithCandles[] | null;
  error: Error | undefined;
}) => {
  const t = useT();
  const governanceLink = useLinks(DApp.Governance);
  const externalLink = governanceLink(TOKEN_NEW_MARKET_PROPOSAL);
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
      <div className="flex justify-between">
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
        <div className="flex">
          {activeTab === 'proposed-markets' && (
            <a
              className="border border-default rounded-lg px-3 py-1.5 my-1 text-sm"
              data-testid="propose-new-market"
              href={externalLink}
              target="_blank"
              rel="noreferrer"
            >
              {t('Propose market')}
            </a>
          )}
        </div>
      </div>
      <div className="h-full my-1 border rounded border-default">
        {activeTab === 'open-markets' && (
          <ErrorBoundary feature="markets-open">
            <OpenMarkets data={activeMarkets} error={error} />
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
