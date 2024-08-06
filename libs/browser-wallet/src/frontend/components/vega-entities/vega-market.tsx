import get from 'lodash/get';

import { useMarket } from '@/hooks/use-market';

import { MarketLink } from './market-link';

export const VegaMarket = ({ marketId }: { marketId: string }) => {
  const market = useMarket(marketId);
  if (!market) return <MarketLink marketId={marketId} />;
  const code = get(market, 'tradableInstrument.instrument.code');
  if (!code) {
    return <MarketLink marketId={marketId} />;
  }

  return <MarketLink name={code} marketId={marketId} />;
};
