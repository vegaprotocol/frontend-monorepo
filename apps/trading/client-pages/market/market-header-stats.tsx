import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { DocsLinks, useEnvironment } from '@vegaprotocol/environment';
import { ButtonLink, ExternalLink, Link } from '@vegaprotocol/ui-toolkit';
import type { Market } from '@vegaprotocol/markets';
import {
  addDecimalsFormatNumber,
  fromNanoSeconds,
  getExpiryDate,
  getMarketExpiryDate,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  Last24hPriceChange,
  Last24hVolume,
  getAsset,
  getDataSourceSpecForSettlementSchedule,
  isMarketInAuction,
  marketInfoProvider,
  useFundingPeriodsQuery,
  useFundingRate,
  useMarketTradingMode,
  useExternalTwap,
} from '@vegaprotocol/markets';
import { MarketState as State } from '@vegaprotocol/types';
import { HeaderStat } from '../../components/header';
import { MarketMarkPrice } from '../../components/market-mark-price';
import { HeaderStatMarketTradingMode } from '../../components/market-trading-mode';
import { MarketState } from '../../components/market-state';
import { MarketLiquiditySupplied } from '../../components/liquidity-supplied';
import { useEffect, useState } from 'react';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { PriceCell } from '@vegaprotocol/datagrid';

interface MarketHeaderStatsProps {
  market: Market;
}

export const MarketHeaderStats = ({ market }: MarketHeaderStatsProps) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

  const asset = getAsset(market);

  return (
    <>
      <HeaderStat heading={t('Mark Price')} testId="market-price">
        <MarketMarkPrice
          marketId={market.id}
          decimalPlaces={market.decimalPlaces}
        />
      </HeaderStat>
      <HeaderStat heading={t('Change (24h)')} testId="market-change">
        <Last24hPriceChange
          marketId={market.id}
          decimalPlaces={market.decimalPlaces}
        />
      </HeaderStat>
      <HeaderStat heading={t('Volume (24h)')} testId="market-volume">
        <Last24hVolume
          marketId={market.id}
          positionDecimalPlaces={market.positionDecimalPlaces}
        />
      </HeaderStat>
      <HeaderStatMarketTradingMode
        marketId={market.id}
        initialTradingMode={market.tradingMode}
      />
      <MarketState market={market} />
      {asset ? (
        <HeaderStat
          heading={t('Settlement asset')}
          testId="market-settlement-asset"
        >
          <div>
            <ButtonLink
              onClick={(e) => {
                openAssetDetailsDialog(asset.id, e.target as HTMLElement);
              }}
            >
              {asset.symbol}
            </ButtonLink>
          </div>
        </HeaderStat>
      ) : null}
      <MarketLiquiditySupplied
        marketId={market.id}
        assetDecimals={asset?.decimals || 0}
        quantum={asset.quantum}
      />
      {market.tradableInstrument.instrument.product.__typename === 'Future' && (
        <HeaderStat
          heading={t('Expiry')}
          description={
            <ExpiryTooltipContent
              market={market}
              explorerUrl={VEGA_EXPLORER_URL}
            />
          }
          testId="market-expiry"
        >
          <ExpiryLabel market={market} />
        </HeaderStat>
      )}
      {market.tradableInstrument.instrument.product.__typename ===
        'Perpetual' && (
        <HeaderStat
          heading={`${t('Funding Rate')} / ${t('Countdown')}`}
          testId="market-funding"
        >
          <div className="flex justify-between gap-2">
            <FundingRate marketId={market.id} />
            <FundingCountdown marketId={market.id} />
          </div>
        </HeaderStat>
      )}
      {market.tradableInstrument.instrument.product.__typename ===
        'Perpetual' && (
        <HeaderStat
          heading={`${t('Index Price')}`}
          description={
            <div className="p1">
              {t(
                'The external time weighted average price (TWAP) received from the data source defined in the data sourcing specification.'
              )}
              {DocsLinks && (
                <ExternalLink
                  href={DocsLinks.ETH_DATA_SOURCES}
                  className="mt-2"
                >
                  {t('Find out more')}
                </ExternalLink>
              )}
            </div>
          }
          testId="index-price"
        >
          <IndexPrice
            marketId={market.id}
            decimalPlaces={
              market.tradableInstrument.instrument.product.settlementAsset
                .decimals
            }
          />
        </HeaderStat>
      )}
    </>
  );
};

type ExpiryLabelProps = {
  market: Market;
};

export const FundingRate = ({ marketId }: { marketId: string }) => {
  const { data: fundingRate } = useFundingRate(marketId);
  return (
    <div data-testid="funding-rate">
      {fundingRate ? `${(Number(fundingRate) * 100).toFixed(4)}%` : '-'}
    </div>
  );
};

export const IndexPrice = ({
  marketId,
  decimalPlaces,
}: {
  marketId: string;
  decimalPlaces?: number;
}) => {
  const { data: externalTwap } = useExternalTwap(marketId);
  return externalTwap && decimalPlaces ? (
    <PriceCell
      value={Number(externalTwap)}
      valueFormatted={addDecimalsFormatNumber(externalTwap, decimalPlaces)}
    />
  ) : (
    '-'
  );
};

const useNow = () => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  return now;
};

const useEvery = (marketId: string) => {
  const { data: marketTradingMode } = useMarketTradingMode(marketId);
  const { data: marketInfo } = useDataProvider({
    dataProvider: marketInfoProvider,
    variables: { marketId },
    skip: !marketTradingMode || isMarketInAuction(marketTradingMode),
  });
  let every: number | undefined = undefined;
  const sourceType =
    marketInfo &&
    getDataSourceSpecForSettlementSchedule(
      marketInfo.tradableInstrument.instrument.product
    )?.data.sourceType.sourceType;

  if (sourceType?.__typename === 'DataSourceSpecConfigurationTimeTrigger') {
    every = sourceType.triggers?.[0]?.every ?? undefined;
    if (every) {
      every *= 1000;
    }
  }
  return every;
};

const useStartTime = (marketId: string) => {
  const { data: fundingPeriods } = useFundingPeriodsQuery({
    variables: {
      marketId: marketId,
      pagination: { first: 1 },
    },
  });
  const node = fundingPeriods?.fundingPeriods.edges?.[0]?.node;
  let startTime: number | undefined = undefined;
  if (node && node.startTime && !node.endTime) {
    startTime = fromNanoSeconds(node.startTime).getTime();
  }
  return startTime;
};

const padStart = (n: number) => n.toString().padStart(2, '0');

const useFormatCountdown = (
  now: number,
  startTime?: number,
  every?: number
) => {
  if (startTime && every) {
    const diff = every - ((now - startTime) % every);
    const hours = (diff / 3.6e6) | 0;
    const mins = ((diff % 3.6e6) / 6e4) | 0;
    const secs = Math.round((diff % 6e4) / 1e3);
    return `${padStart(hours)}:${padStart(mins)}:${padStart(secs)}`;
  }
  return t('Unknown');
};

export const FundingCountdown = ({ marketId }: { marketId: string }) => {
  const now = useNow();
  const startTime = useStartTime(marketId);
  const every = useEvery(marketId);

  return (
    <div data-testid="funding-countdown">
      {useFormatCountdown(now, startTime, every)}
    </div>
  );
};

const ExpiryLabel = ({ market }: ExpiryLabelProps) => {
  const content = market.tradableInstrument.instrument.metadata.tags
    ? getExpiryDate(
        market.tradableInstrument.instrument.metadata.tags,
        market.marketTimestamps.close,
        market.state
      )
    : '-';
  return <div data-testid="trading-expiry">{content}</div>;
};

type ExpiryTooltipContentProps = {
  market: Market;
  explorerUrl?: string;
};

const ExpiryTooltipContent = ({
  market,
  explorerUrl,
}: ExpiryTooltipContentProps) => {
  if (market.marketTimestamps.close === null) {
    const oracleId =
      market.tradableInstrument.instrument.product.__typename === 'Future'
        ? market.tradableInstrument.instrument.product
            .dataSourceSpecForTradingTermination?.id
        : undefined;

    const metadataExpiryDate = getMarketExpiryDate(
      market.tradableInstrument.instrument.metadata.tags
    );

    const isExpired =
      metadataExpiryDate &&
      Date.now() - metadataExpiryDate.valueOf() > 0 &&
      (market.state === State.STATE_TRADING_TERMINATED ||
        market.state === State.STATE_SETTLED);

    return (
      <section data-testid="expiry-tooltip">
        <p className="mb-2">
          {t(
            'This market expires when triggered by its oracle, not on a set date.'
          )}
        </p>
        {metadataExpiryDate && !isExpired && (
          <p className="mb-2">
            {t(
              'This timestamp is user curated metadata and does not drive any on-chain functionality.'
            )}
          </p>
        )}
        {explorerUrl && oracleId && (
          <Link href={`${explorerUrl}/oracles#${oracleId}`} target="_blank">
            {t('View oracle specification')}
          </Link>
        )}
      </section>
    );
  }

  return null;
};
