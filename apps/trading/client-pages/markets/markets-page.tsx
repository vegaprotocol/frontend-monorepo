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
  type MarketMaybeWithCandles,
} from '@vegaprotocol/markets';
import { useYesterday } from '@vegaprotocol/react-helpers';
import { useEffect } from 'react';
import { AccountType, Interval } from '@vegaprotocol/types';
import { priceChangeRenderer, priceValueFormatter } from './use-column-defs';
import {
  addDecimal,
  formatNumber,
  priceChangePercentage,
  toBigNum,
} from '@vegaprotocol/utils';
import { Link } from 'react-router-dom';
import orderBy from 'lodash/orderBy';
import BigNumber from 'bignumber.js';

const POLLING_TIME = 2000;

export const TopThreeMarkets = ({
  markets,
}: {
  markets?: MarketMaybeWithCandles[];
}) => {
  return (
    <div className="grid auto-rows-min grid-cols-5 gap-3 text-sm">
      {markets?.map((market) => {
        return (
          <>
            <span className="col-span-2">
              <Link to={`/markets/${market.id}`}>
                {market.tradableInstrument.instrument.name}
              </Link>
            </span>
            <span className="col-span-1">{priceValueFormatter(market)}</span>
            <span className="col-span-2">{priceChangeRenderer(market)}</span>
          </>
        );
      })}
    </div>
  );
};

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

  const topGainers = orderBy(
    activeMarkets,
    [
      (m) => {
        if (!m.candles?.length) return 0;
        return Number(
          priceChangePercentage(
            m.candles.filter((c) => c.close !== '').map((c) => c.close)
          )
        );
      },
    ],
    ['desc']
  ).slice(0, 3);

  const newListings = orderBy(
    activeMarkets,
    [(m) => new Date(m.marketTimestamps.open).getTime()],
    ['desc']
  ).slice(0, 3);

  const totalVolume24hCandles = [];
  for (let i = 1; i < 24; i++) {
    const totalVolume24hr = activeMarkets?.reduce((acc, market) => {
      const c = market.candles?.[i];
      if (!c) return acc;
      return (
        acc +
        new BigNumber(acc)
          // Using notional both price and size need conversion with decimals,
          // we can achieve the same result by just combining them
          .plus(
            toBigNum(
              c.notional,
              market.decimalPlaces + market.positionDecimalPlaces
            )
          )
          .toNumber()
      );
    }, 0);
    totalVolume24hCandles.push(totalVolume24hr || 0);
  }

  const sparkline = (
    <Sparkline width={80} height={20} data={totalVolume24hCandles || []} />
  );

  const tvl = activeMarkets?.reduce((acc, market) => {
    const accounts = market.accountsConnection?.edges
      ?.filter((e) => e?.node?.type === AccountType.ACCOUNT_TYPE_INSURANCE)
      .map((e) => e?.node);
    const balance = accounts?.reduce((acc, a) => {
      return acc + Number(addDecimal(a?.balance || 0, a?.asset.decimals || 0));
    }, 0);
    if (!balance) return acc;
    return acc + balance;
  }, 0);

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
          <div className="flex flex-col gap-2 col-span-full lg:col-auto">
            <Card key="24h-vol" className="grow">
              <div className="flex items-center justify-center h-full w-full">
                <div className="flex items-center gap-2 justify-between w-full">
                  <div className="flex flex-col">
                    <span className="text-xl">
                      {totalVolume24h && formatNumber(totalVolume24h, 2)} USDT
                    </span>
                    <span className="text-xs">{t('24h volume')}</span>
                  </div>
                  <div>{sparkline}</div>
                </div>
              </div>
            </Card>
            <Card key="24h-vol" className="grow">
              <div className="flex items-center justify-center h-full w-full">
                <div className="flex items-center gap-2 justify-between w-full">
                  <div className="flex flex-col">
                    <span className="text-xl">
                      {tvl && formatNumber(tvl, 2)} USDT
                    </span>
                    <span className="text-xs">TVL</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <Card key="top-gainers" title={t('Top gainers')}>
            <TopThreeMarkets markets={topGainers} />
          </Card>
          <Card key="new-listings" title={t('New listings')}>
            <TopThreeMarkets markets={newListings} />
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
