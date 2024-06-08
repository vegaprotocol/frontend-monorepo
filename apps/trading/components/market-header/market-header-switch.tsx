import { MarketHeaderSpot } from './market-header-spot';
import { MarketHeaderFuture } from './market-header-future';
import { MarketHeaderPerp } from './market-header-perp';
import {
  type Market,
  isSpot,
  isFuture,
  isPerpetual,
} from '@vegaprotocol/data-provider';

export const MarketHeaderSwitch = ({ market }: { market: Market }) => {
  const { product } = market.tradableInstrument.instrument;

  if (isSpot(product)) {
    return <MarketHeaderSpot market={market} />;
  }

  if (isFuture(product)) {
    return <MarketHeaderFuture market={market} />;
  }

  if (isPerpetual(product)) {
    return <MarketHeaderPerp market={market} />;
  }

  throw new Error('invalid product type');
};
