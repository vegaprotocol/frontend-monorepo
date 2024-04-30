import { Popover, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { Header, HeaderTitle } from '../header';
import { Route, Routes, useParams } from 'react-router-dom';
import { MarketSelector } from '../../components/market-selector/market-selector';
import { useMarket, useMarketList } from '@vegaprotocol/markets';
import { useState } from 'react';
import { ProductTypeShortName } from '@vegaprotocol/types';
import { MarketHeaderSwitch } from './market-header-switch';
import { EmblemByMarket } from '@vegaprotocol/emblem';
import { useChainId } from '@vegaprotocol/wallet-react';

export const MarketHeader = () => {
  const { marketId } = useParams();
  const { data } = useMarket(marketId);
  const [open, setOpen] = useState(false);
  const { chainId } = useChainId();

  // Ensure that markets are kept cached so opening the list
  // shows all markets instantly
  useMarketList();

  if (!data) return null;

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
                    <span>
                      {marketId && (
                        <span className="mr-4">
                          <EmblemByMarket
                            market={marketId}
                            vegaChain={chainId}
                          />
                        </span>
                      )}
                      {data.tradableInstrument.instrument.code}
                      <span className="ml-1 text-xs uppercase text-muted">
                        {data.tradableInstrument.instrument.product
                          .__typename &&
                          ProductTypeShortName[
                            data.tradableInstrument.instrument.product
                              .__typename
                          ]}
                      </span>
                    </span>
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
