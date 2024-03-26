import type { Market } from '@vegaprotocol/markets';
import { useT } from '../../lib/use-t';

import { AssetHeaderStat } from './asset-header-stat';
import { LastTradeHeaderStat } from './last-trade-header-stat';
import { Last24hPriceChangeHeaderStat } from './last-24h-price-change-header-stat';
import { Last24hVolumeChangeHeaderStat } from './last-24h-volume-change-header-stat';

interface MarketHeaderStatsProps {
  market: Market;
}

export const MarketHeaderSpot = ({ market }: MarketHeaderStatsProps) => {
  if (market.tradableInstrument.instrument.product.__typename !== 'Spot') {
    throw new Error('incorrect market type for header');
  }

  const t = useT();
  const quoteAsset = market.tradableInstrument.instrument.product.quoteAsset;
  const baseAsset = market.tradableInstrument.instrument.product.baseAsset;

  return (
    <>
      <LastTradeHeaderStat
        marketId={market.id}
        decimalPlaces={market.decimalPlaces}
      />
      <Last24hPriceChangeHeaderStat
        marketId={market.id}
        decimalPlaces={market.decimalPlaces}
      />
      <Last24hVolumeChangeHeaderStat
        marketId={market.id}
        marketDecimalPlaces={market.decimalPlaces}
        positionDecimalPlaces={market.positionDecimalPlaces}
        quoteUnit={quoteAsset.symbol}
      />
      <AssetHeaderStat
        heading={t('Quote asset')}
        asset={quoteAsset}
        data-testid="quote-asset"
      />
      <AssetHeaderStat
        heading={t('Base asset')}
        asset={baseAsset}
        data-testid="base-asset"
      />
    </>
  );
};
