import { EmblemByMarket } from '@vegaprotocol/emblem';
import type { MarketMaybeWithCandles } from '@vegaprotocol/markets';
import { useChainId } from '@vegaprotocol/wallet-react';
import { Link } from 'react-router-dom';
import {
  priceValueFormatter,
  priceChangeRenderer,
  priceChangeSparklineRenderer,
} from './use-column-defs';
import { Links } from '../../lib/links';

export const TopMarketList = ({
  markets,
}: {
  markets?: MarketMaybeWithCandles[];
}) => {
  const { chainId } = useChainId();
  return (
    <>
      {markets?.map((market) => {
        return (
          <div
            className="grid auto-rows-min grid-cols-8 gap-3 text-sm"
            key={market.id}
          >
            <span className="col-span-3 overflow-hidden">
              <Link to={Links.MARKET(market.id)}>
                <span className="flex items-center">
                  <span className="pr-1">
                    <EmblemByMarket market={market.id} vegaChain={chainId} />
                  </span>
                  <span>{market.tradableInstrument.instrument.code}</span>
                </span>
              </Link>
            </span>
            <span className="col-span-2 text-right">
              {priceValueFormatter(market, 2)}
            </span>
            <span className="col-span-3 flex justify-end gap-1 text-xs">
              {priceChangeRenderer(market)}
              {priceChangeSparklineRenderer(market)}
            </span>
          </div>
        );
      })}
    </>
  );
};
