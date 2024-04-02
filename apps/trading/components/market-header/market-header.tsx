import { Popover, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { Header, HeaderTitle } from '../header';
import { Route, Routes, useParams } from 'react-router-dom';
import { MarketSelector } from '../../components/market-selector/market-selector';
import { MarketHeaderStats } from './market-header-stats';
import {
  type Market,
  getProductType,
  useMarket,
  useMarketList,
} from '@vegaprotocol/markets';
import { useState } from 'react';
import { ProductTypeShortName } from '@vegaprotocol/types';
import { MarketHeaderSpot } from './market-header-spot';

export const MarketHeader = () => {
  const { marketId } = useParams();
  const { data } = useMarket(marketId);
  const [open, setOpen] = useState(false);

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

export const MarketHeaderSwitch = ({ market }: { market: Market }) => {
  const productType = getProductType(market);

  if (productType === 'Spot') {
    return <MarketHeaderSpot market={market} />;
  }

  if (productType === 'Future') {
    return <MarketHeaderStats market={market} />;
  }

  if (productType === 'Perpetual') {
    return <MarketHeaderStats market={market} />;
  }

  throw new Error('invalid product type');
};
