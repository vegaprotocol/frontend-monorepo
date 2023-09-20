import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { useEnvironment } from '@vegaprotocol/environment';
import { ButtonLink, Link } from '@vegaprotocol/ui-toolkit';
import { MarketProposalNotification } from '@vegaprotocol/proposals';
import type { Market } from '@vegaprotocol/markets';
import {
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
  marketInfoProvider,
  useFundingPeriodsQuery,
  useFundingRate,
} from '@vegaprotocol/markets';
import { MarketState as State } from '@vegaprotocol/types';
import { HeaderStat } from '../../components/header';
import { MarketMarkPrice } from '../../components/market-mark-price';
import { HeaderStatMarketTradingMode } from '../../components/market-trading-mode';
import { MarketState } from '../../components/market-state';
import { MarketLiquiditySupplied } from '../../components/liquidity-supplied';
import { useEffect, useState } from 'react';
import { useDataProvider } from '@vegaprotocol/data-provider';

interface MarketHeaderStatsProps {
  market: Market;
}

export const MarketHeaderStats = ({ market }: MarketHeaderStatsProps) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

  const asset = getAsset(market);

  return (
    <>
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
          heading={`${t('Funding')} / ${t('Countdown')}`}
          testId="market-funding"
        >
          <div className="flex justify-between gap-2">
            <FundingRate marketId={market.id} />
            <FundingCountdown marketId={market.id} />
          </div>
        </HeaderStat>
      )}
      <HeaderStat heading={t('Price')} testId="market-price">
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
      />
      <MarketProposalNotification marketId={market.id} />
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

const padStart = (n: number) => n.toString().padStart(2, '0');

export const FundingCountdown = ({ marketId }: { marketId: string }) => {
  const { data: fundingPeriods } = useFundingPeriodsQuery({
    variables: {
      marketId: marketId,
      pagination: { first: 1 },
    },
  });
  const { data: marketInfo } = useDataProvider({
    dataProvider: marketInfoProvider,
    variables: { marketId },
  });

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const node = fundingPeriods?.fundingPeriods.edges?.[0]?.node;
  let startTime: number | undefined = undefined;
  if (node && node.startTime && !node.endTime) {
    startTime = fromNanoSeconds(node.startTime).getTime();
  }
  let diffFormatted = t('Unknown');
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
  if (startTime && every) {
    const diff = every - ((now - startTime) % every);
    const hours = (diff / 3.6e6) | 0;
    const mins = ((diff % 3.6e6) / 6e4) | 0;
    const secs = Math.round((diff % 6e4) / 1e3);
    diffFormatted = `${padStart(hours)}:${padStart(mins)}:${padStart(secs)}`;
  }
  return <div data-testid="funding-countdown">{diffFormatted}</div>;
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
