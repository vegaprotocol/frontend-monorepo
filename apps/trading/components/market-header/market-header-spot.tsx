import { type Market } from '@vegaprotocol/data-provider';
import { useT } from '../../lib/use-t';
import * as Stats from './stats';

interface MarketHeaderSpotProps {
  market: Market;
}

export const MarketHeaderSpot = ({ market }: MarketHeaderSpotProps) => {
  if (market.tradableInstrument.instrument.product.__typename !== 'Spot') {
    throw new Error('incorrect market type for header');
  }

  const t = useT();
  const quoteAsset = market.tradableInstrument.instrument.product.quoteAsset;
  const baseAsset = market.tradableInstrument.instrument.product.baseAsset;

  return (
    <>
      <Stats.LastTradeStat
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
        quoteUnit={quoteAsset.symbol}
        baseUnit={baseAsset.symbol}
      />
      <Stats.MarketTradingModeStat marketId={market.id} />
      <Stats.MarketStateStat marketId={market.id} />
      <Stats.AssetStat
        heading={t('Quote asset')}
        asset={quoteAsset}
        data-testid="quote-asset"
      />
      <Stats.AssetStat
        heading={t('Base asset')}
        asset={baseAsset}
        data-testid="base-asset"
      />
      <Stats.Oracle marketId={market.id} />
    </>
  );
};
