import { EmblemByMarket } from '@vegaprotocol/emblem';
import { useChainId } from '@vegaprotocol/wallet-react';
import { Link } from 'react-router-dom';
import {
  priceValueFormatter,
  PriceChange,
  PriceChangeSparkline,
} from './use-column-defs';
import { Links } from '../../lib/links';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { type Market } from '@vegaprotocol/data-provider';

export const TopMarketList = ({ markets }: { markets?: Market[] }) => {
  const { chainId } = useChainId();
  return (
    <div className="flex flex-col justify-between gap-5">
      {markets?.map((market) => {
        return (
          <div
            className="grid auto-rows-min grid-cols-8 gap-3 text-sm"
            key={market.id}
          >
            <span className="col-span-3 overflow-hidden">
              <Tooltip description={market.tradableInstrument.instrument.name}>
                <Link to={Links.MARKET(market.id)}>
                  <span className="flex items-center">
                    <span>
                      <EmblemByMarket
                        market={market.id}
                        vegaChain={chainId}
                        size={26}
                      />
                    </span>
                    <span className="text-sm overflow-hidden text-ellipsis">
                      {market.tradableInstrument.instrument.code}
                    </span>
                  </span>
                </Link>
              </Tooltip>
            </span>
            <span className="col-span-2 text-right font-mono">
              {priceValueFormatter(market, 2)}
            </span>
            <span className="col-span-3 flex justify-end gap-1 text-xs">
              <PriceChange market={market} showChangeValue={false} />
              <PriceChangeSparkline market={market} />
            </span>
          </div>
        );
      })}
    </div>
  );
};
