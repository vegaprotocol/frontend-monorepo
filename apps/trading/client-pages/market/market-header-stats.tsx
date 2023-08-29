import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { useEnvironment } from '@vegaprotocol/environment';
import { ButtonLink, Link } from '@vegaprotocol/ui-toolkit';
import { MarketProposalNotification } from '@vegaprotocol/proposals';
import type { Market } from '@vegaprotocol/markets';
import { getExpiryDate, getMarketExpiryDate } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  Last24hPriceChange,
  Last24hVolume,
  getAsset,
} from '@vegaprotocol/markets';
import { MarketState as State } from '@vegaprotocol/types';
import { HeaderStat } from '../../components/header';
import { MarketMarkPrice } from '../../components/market-mark-price';
import { HeaderStatMarketTradingMode } from '../../components/market-trading-mode';
import { MarketState } from '../../components/market-state';
import { MarketLiquiditySupplied } from '../../components/liquidity-supplied';

interface MarketHeaderStatsProps {
  market: Market;
}

export const MarketHeaderStats = ({ market }: MarketHeaderStatsProps) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

  const asset = getAsset(market);

  return (
    <>
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
