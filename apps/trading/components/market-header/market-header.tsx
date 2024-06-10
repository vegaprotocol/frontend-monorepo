import {
  Popover,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { Header, HeaderTitle } from '../header';
import { Route, Routes, useParams } from 'react-router-dom';
import { MarketSelector } from '../../components/market-selector/market-selector';
import { useMarketList, useMarketWithData } from '@vegaprotocol/markets';
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
    <Routes>
      <Route
        path=":marketId"
        element={
          <Header
            title={
              <Popover
                open={open}
                onOpenChange={setOpen}
                trigger={
                  <HeaderTitle>
                    <Tooltip description={t(tooltip)}>
                      <h3 className="flex items-center gap-1">
                        <span className="mr-1">
                          <EmblemByMarket
                            market={data?.id || ''}
                            vegaChain={chainId}
                          />
                        </span>

                        <span className="flex gap-1 items-center">
                          {data.tradableInstrument.instrument.code}
                          <MarketProductPill
                            productType={
                              data.tradableInstrument.instrument.product
                                .__typename
                            }
                          />
                          <MarketIcon data={data} />
                        </span>
                      </h3>
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
        }
      />
    </Routes>
  );
};
