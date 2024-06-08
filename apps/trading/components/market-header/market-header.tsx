import {
  Popover,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { Header, HeaderTitle } from '../header';
import { Route, Routes, useParams } from 'react-router-dom';
import { MarketSelector } from '../../components/market-selector/market-selector';
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
import { useMarket } from '@vegaprotocol/data-provider';

export const MarketHeader = () => {
  const { marketId } = useParams();
  const { data } = useMarket({ marketId });
  const [open, setOpen] = useState(false);
  const { chainId } = useChainId();
  const t = useT();

  if (!data) return null;

  const tooltip = getMarketStateTooltip(
    data.data?.marketState,
    data.data?.marketTradingMode
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
                      <span className="flex items-center gap-4">
                        {marketId && (
                          <span>
                            <EmblemByMarket
                              market={marketId}
                              vegaChain={chainId}
                            />
                          </span>
                        )}
                        <div>
                          <div className="text-lg leading-none">
                            {data.tradableInstrument.instrument.code}
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs uppercase text-muted mr-1">
                              {data.tradableInstrument.instrument.product
                                .__typename &&
                                ProductTypeShortName[
                                  data.tradableInstrument.instrument.product
                                    .__typename
                                ]}
                            </span>
                            <MarketIcon data={data} />
                          </div>
                        </div>
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
        }
      />
    </Routes>
  );
};
