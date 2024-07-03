import {
  Popover,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { Header, HeaderTitle } from '../header';
import { useParams } from 'react-router-dom';
import { MarketSelector } from '../../components/market-selector/market-selector';
import {
  getProductType,
  useMarketList,
  useMarketWithData,
} from '@vegaprotocol/markets';
import { useState } from 'react';
import { MarketHeaderSwitch } from './market-header-switch';
import { EmblemByMarket } from '@vegaprotocol/emblem';
import { useChainId } from '@vegaprotocol/wallet-react';
import {
  MarketIcon,
  getMarketStateTooltip,
} from '../../client-pages/markets/market-icon';
import { useT } from '../../lib/use-t';
import { MarketProductPill } from '@vegaprotocol/datagrid';

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
              <Tooltip description={t(tooltip)}>
                <span className="flex items-center gap-1">
                  <EmblemByMarket
                    market={data.id}
                    vegaChain={chainId}
                    size={26}
                  />
                  {data.tradableInstrument.instrument.code}
                  <MarketProductPill productType={getProductType(data)} />
                  <MarketIcon data={data} />
                </span>
              </Tooltip>
              <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={14} />
            </HeaderTitle>
          }
          alignOffset={-10}
          sideOffset={12}
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
