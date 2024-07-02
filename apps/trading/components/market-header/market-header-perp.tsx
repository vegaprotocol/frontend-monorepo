import type { Market } from '@vegaprotocol/markets';
import { getAsset, getQuoteName } from '@vegaprotocol/markets';
import { useT } from '../../lib/use-t';
import * as Stats from './stats';

interface MarketHeaderPerpProps {
  market: Market;
}

export const MarketHeaderPerp = ({ market }: MarketHeaderPerpProps) => {
  if (market.tradableInstrument.instrument.product.__typename !== 'Perpetual') {
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
      <Stats.MarketTradingModeStat marketId={market.id} />
      <Stats.MarketStateStat marketId={market.id} />
      <Stats.AssetStat
        heading={t('Settlement asset')}
        asset={asset}
        data-testid="market-settlement-asset"
      />
      <Stats.Oracle marketId={market.id} />
      <Stats.LiquidityStat
        marketId={market.id}
        assetDecimals={asset.decimals}
        quantum={asset.quantum}
      />
      <Stats.FundingRateStat marketId={market.id} />
      <Stats.IndexPriceStat
        marketId={market.id}
        assetDecimals={asset.decimals}
        markPriceConfiguration={market.markPriceConfiguration}
      />
    </>
  );
};
