import { useEnvironment } from '@vegaprotocol/environment';
import { Link } from '@vegaprotocol/ui-toolkit';
import type { Market } from '@vegaprotocol/markets';
import { getExpiryDate, getMarketExpiryDate } from '@vegaprotocol/utils';
import { getAsset, getQuoteName } from '@vegaprotocol/markets';
import { MarketState as State } from '@vegaprotocol/types';
import { HeaderStat } from '../../components/header';
import { MarketMarkPrice } from '../../components/market-mark-price';
import { HeaderStatMarketTradingMode } from '../../components/market-trading-mode';
import { MarketState } from '../../components/market-state';
import { MarketLiquiditySupplied } from '../../components/liquidity-supplied';
import { useT } from '../../lib/use-t';
import { AssetHeaderStat } from './asset-header-stat';
import { Last24hPriceChangeHeaderStat } from './last-24h-price-change-header-stat';
import { Last24hVolumeChangeHeaderStat } from './last-24h-volume-change-header-stat';

interface MarketHeaderFutureProps {
  market: Market;
}

export const MarketHeaderFuture = ({ market }: MarketHeaderFutureProps) => {
  if (market.tradableInstrument.instrument.product.__typename !== 'Future') {
    throw new Error('incorrect market type for header');
  }

  const t = useT();
  const { VEGA_EXPLORER_URL } = useEnvironment();

  const asset = getAsset(market);
  const quoteUnit = getQuoteName(market);

  return (
    <>
      <HeaderStat heading={t('Mark Price')} data-testid="market-price">
        <MarketMarkPrice
          marketId={market.id}
          decimalPlaces={market.decimalPlaces}
        />
      </HeaderStat>
      <Last24hPriceChangeHeaderStat
        marketId={market.id}
        decimalPlaces={market.decimalPlaces}
      />
      <Last24hVolumeChangeHeaderStat
        marketId={market.id}
        marketDecimalPlaces={market.decimalPlaces}
        positionDecimalPlaces={market.positionDecimalPlaces}
        quoteUnit={quoteUnit}
      />
      <HeaderStatMarketTradingMode
        marketId={market.id}
        initialTradingMode={market.tradingMode}
      />
      <MarketState market={market} />
      <AssetHeaderStat
        heading={t('Settlement asset')}
        asset={asset}
        data-testid="market-settlement-asset"
      />
      <MarketLiquiditySupplied
        marketId={market.id}
        assetDecimals={asset?.decimals || 0}
        quantum={asset.quantum}
      />
      <HeaderStat
        heading={t('Expiry')}
        description={
          <ExpiryTooltipContent
            market={market}
            explorerUrl={VEGA_EXPLORER_URL}
          />
        }
        data-testid="market-expiry"
      >
        <ExpiryLabel market={market} />
      </HeaderStat>
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
  const t = useT();
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
