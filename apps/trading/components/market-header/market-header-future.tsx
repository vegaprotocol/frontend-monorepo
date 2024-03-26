import type { Market } from '@vegaprotocol/markets';
import { getAsset, getQuoteName } from '@vegaprotocol/markets';
import { MarketLiquiditySupplied } from '../../components/liquidity-supplied';
import { useT } from '../../lib/use-t';
import * as Stats from './stats';

interface MarketHeaderFutureProps {
  market: Market;
}

export const MarketHeaderFuture = ({ market }: MarketHeaderFutureProps) => {
  if (market.tradableInstrument.instrument.product.__typename !== 'Future') {
    throw new Error('incorrect market type for header');
  }

  const t = useT();

  const asset = getAsset(market);
  const quoteUnit = getQuoteName(market);

  return (
    <>
      <Stats.MarkPriceStat
        marketId={market.id}
        decimalPlaces={market.decimalPlaces}
      />
      <Stats.Last24hPriceChangeStat
        marketId={market.id}
        decimalPlaces={market.decimalPlaces}
      />
      <Stats.Last24hVolumeChangeStat
        marketId={market.id}
        marketDecimalPlaces={market.decimalPlaces}
        positionDecimalPlaces={market.positionDecimalPlaces}
        quoteUnit={quoteUnit}
      />
      <Stats.MarketTradingModeStat
        marketId={market.id}
        initialTradingMode={market.tradingMode}
      />
      <Stats.MarketStateStat market={market} />
      <Stats.AssetStat
        heading={t('Settlement asset')}
        asset={asset}
        data-testid="market-settlement-asset"
      />
      <MarketLiquiditySupplied
        marketId={market.id}
        assetDecimals={asset?.decimals || 0}
        quantum={asset.quantum}
      />
      <Stats.ExpiryStat market={market} />
    </>
  );
};
