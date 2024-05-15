import {
  Popover,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { Header, HeaderTitle } from '../header';
import { useParams } from 'react-router-dom';
import { MarketSelector } from '../../components/market-selector/market-selector';
import { useMarketList, useMarketWithData } from '@vegaprotocol/markets';
import { useState } from 'react';
import { ProductTypeShortName } from '@vegaprotocol/types';
import { MarketHeaderSwitch } from './market-header-switch';
import { EmblemByMarket } from '@vegaprotocol/emblem';
import { useChainId } from '@vegaprotocol/wallet-react';
import {
  MarketIcon,
  getMarketStateTooltip,
} from '../../client-pages/markets/market-icon';
import { useT } from '../../lib/use-t';

export const MarketHeader = () => {
  const { marketId } = useParams();
  const { data } = useMarketWithData(marketId);
  const [open, setOpen] = useState(false);
  const { chainId } = useChainId();
  const t = useT();

  // Ensure that markets are kept cached so opening the list
  // shows all markets instantly
  useMarketList();

  if (!data) return null;

  const tooltip = getMarketStateTooltip(
    data.data.marketState,
    data.data.marketTradingMode
  );

  return (
    <Header
      title={
        <Popover
          open={open}
          onOpenChange={setOpen}
          trigger={
            <HeaderTitle>
              <Tooltip description={<span>{t(tooltip)}</span>}>
                <span className="flex items-center">
                  {marketId && (
                    <span className="mr-4">
                      <EmblemByMarket market={marketId} vegaChain={chainId} />
                    </span>
                  )}

                  <span> {data.tradableInstrument.instrument.code}</span>

                  <span className="ml-1 text-xs uppercase text-muted">
                    {data.tradableInstrument.instrument.product.__typename &&
                      ProductTypeShortName[
                        data.tradableInstrument.instrument.product.__typename
                      ]}
                  </span>
                  <span className="ml-1">
                    <MarketIcon data={data} />
                  </span>
                </span>
              </Tooltip>
              <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={14} />
            </HeaderTitle>
          }
          alignOffset={-10}
        >
          <MarketSelector
            currentMarketId={marketId}
            onSelect={() => setOpen(false)}
          />
        </Popover>
      }
    >
      <MarketHeaderSwitch market={data} />
    </Header>
  );
};
