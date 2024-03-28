import { type Market, getProductType } from '@vegaprotocol/markets';
import { MarketHeaderSpot } from './market-header-spot';
import { MarketHeaderFuture } from './market-header-future';
import { MarketHeaderPerp } from './market-header-perp';

export const MarketHeaderSwitch = ({ market }: { market: Market }) => {
  const productType = getProductType(market);

  if (productType === 'Spot') {
    return <MarketHeaderSpot market={market} />;
  }

  if (productType === 'Future') {
    return <MarketHeaderFuture market={market} />;
  }

  if (productType === 'Perpetual') {
    return <MarketHeaderPerp market={market} />;
  }

  throw new Error('invalid product type');
};
