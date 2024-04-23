import {
  LocalStoragePersistTabs as Tabs,
  Tab,
  TradingAnchorButton,
  Sparkline,
} from '@vegaprotocol/ui-toolkit';
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
import { MarketsSettings } from './markets-settings';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { Card } from '../../components/card';
import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  activeMarketsWithCandlesProvider,
  calcCandleVolumePrice,
} from '@vegaprotocol/markets';
import { useYesterday } from '@vegaprotocol/react-helpers';
import { useEffect } from 'react';
import { Interval } from '@vegaprotocol/types';
import { formatNumber } from '@vegaprotocol/utils';
import { TopMarketList } from './top-market-list';
import {
  useNewListings,
  useTVL,
  useTopGainers,
  useTotalVolume24hCandles,
} from './use-markets-stats';

const POLLING_TIME = 2000;

export const MarketsPage = () => {
  const t = useT();
  const governanceLink = useLinks(DApp.Governance);
  const externalLink = governanceLink(TOKEN_NEW_MARKET_PROPOSAL);

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
    <Sparkline width={80} height={20} data={totalVolume24hCandles || []} />
  );

  const tvl = useTVL(activeMarkets);

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
    <>
      <div className="flex flex-col w-full gap-3 p-3 lg:px-40">
        <div className="grid auto-rows-min grid-cols-3 gap-3 w-full">
          <div className="flex flex-col gap-2 col-span-1 lg:col-auto">
            <Card key="24h-vol" className="grow">
              <div className="flex items-center justify-center h-full w-full">
                <div className="flex items-center gap-2 justify-between w-full">
                  <div className="flex flex-col">
                    {totalVolume24h && (
                      <span className="text-xl">
                        ${formatNumber(totalVolume24h, 2)}
                      </span>
                    )}
                    <span className="text-xs">{t('24h volume')}</span>
                  </div>
                  <div>{totalVolumeSparkline}</div>
                </div>
              </div>
            </Card>
            <Card key="24h-vol" className="grow">
              <div className="flex items-center justify-center h-full w-full">
                <div className="flex items-center gap-2 justify-between w-full">
                  <div className="flex flex-col">
                    {tvl && (
                      <span className="text-xl">${formatNumber(tvl, 2)}</span>
                    )}
                    <span className="text-xs">TVL</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <Card
            key="top-gainers"
            title={t('Top gainers')}
            className="col-span-1"
          >
            <TopMarketList markets={topGainers} />
          </Card>
          <Card
            key="new-listings"
            title={t('New listings')}
            className="col-span-1"
          >
            <TopMarketList markets={newListings} />
          </Card>
        </div>
      </div>
      <div className="h-[70%] pt-0.5 pb-3 px-1.5 lg:px-40">
        <div className="h-full my-1 border rounded border-default">
          <Tabs storageKey="console-markets">
            <Tab
              id="open-markets"
              name={t('Open markets')}
              settings={<MarketsSettings />}
            >
              <ErrorBoundary feature="markets-open">
                <OpenMarkets data={activeMarkets} error={error} />
              </ErrorBoundary>
            </Tab>
            <Tab
              id="proposed-markets"
              name={t('Proposed markets')}
              settings={<MarketsSettings />}
              menu={
                <TradingAnchorButton
                  size="extra-small"
                  data-testid="propose-new-market"
                  href={externalLink}
                  target="_blank"
                >
                  {t('Propose a new market')}
                </TradingAnchorButton>
              }
            >
              <ErrorBoundary feature="markets-proposed">
                <Proposed />
              </ErrorBoundary>
            </Tab>
            <Tab
              id="closed-markets"
              name={t('Closed markets')}
              settings={<MarketsSettings />}
            >
              <ErrorBoundary feature="markets-closed">
                <Closed />
              </ErrorBoundary>
            </Tab>
          </Tabs>
        </div>
      </div>
    </>
  );
};
