import { EmblemByMarket } from '@vegaprotocol/emblem';
import type { MarketMaybeWithCandles } from '@vegaprotocol/markets';
import { useChainId } from '@vegaprotocol/wallet-react';
import { Link } from 'react-router-dom';
import { priceValueFormatter, priceChangeRenderer } from './use-column-defs';

export const TopMarketList = ({
  markets,
}: {
  markets?: MarketMaybeWithCandles[];
}) => {
  const { chainId } = useChainId();
  return (
    <div className="grid auto-rows-min grid-cols-6 gap-3 text-sm">
      {markets?.map((market) => {
        return (
          <>
            <span className="col-span-3">
              <Link to={`/markets/${market.id}`}>
                <span className="pr-1">
                  <EmblemByMarket market={market.id} vegaChain={chainId} />
                </span>
                {market.tradableInstrument.instrument.name}
              </Link>
            </span>
            <span className="col-span-1">{priceValueFormatter(market)}</span>
            <span className="col-span-2">{priceChangeRenderer(market)}</span>
          </>
        );
      })}
    </div>
  );
};
