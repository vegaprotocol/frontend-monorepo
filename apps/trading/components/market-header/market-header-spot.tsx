import type { Market } from '@vegaprotocol/markets';
import { AssetHeaderStat } from './asset-header-stat';
import { useT } from '../../lib/use-t';
import { LastTradeHeaderStat } from './last-trade-header-stat';

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
