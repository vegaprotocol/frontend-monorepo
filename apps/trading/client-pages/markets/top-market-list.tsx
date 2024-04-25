import { EmblemByMarket } from '@vegaprotocol/emblem';
import type { MarketMaybeWithCandles } from '@vegaprotocol/markets';
import { useChainId } from '@vegaprotocol/wallet-react';
import { Link } from 'react-router-dom';
import {
  priceValueFormatter,
  priceChangeRenderer,
  priceChangeSparklineRenderer,
} from './use-column-defs';
import { StackedCell } from '@vegaprotocol/datagrid';

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
            className="grid auto-rows-min grid-cols-7 gap-3 text-xs"
            key={market.id}
          >
            <span className="col-span-3 overflow-hidden">
              <Link to={`/markets/${market.id}`}>
                <span className="flex items-center">
                  <span className="pr-1">
                    <EmblemByMarket market={market.id} vegaChain={chainId} />
                  </span>
                  <StackedCell
                    primary={market.tradableInstrument.instrument.code}
                    secondary={market.tradableInstrument.instrument.name}
                  />
                </span>
              </Link>
            </span>
            <span className="col-span-1">{priceValueFormatter(market, 2)}</span>
            <span className="col-span-1 flex justify-end">
              {priceChangeRenderer(market)}
            </span>
            <span className="col-span-2 flex justify-end">
              {priceChangeSparklineRenderer(market)}
            </span>
          </div>
        );
      })}
    </>
  );
};
