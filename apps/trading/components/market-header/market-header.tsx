import { Popover, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { Header, HeaderTitle } from '../header';
import { useParams } from 'react-router-dom';
import { MarketSelector } from '../../components/market-selector/market-selector';
import { MarketHeaderStats } from '../../client-pages/market/market-header-stats';
import { useMarket, useMarketList } from '@vegaprotocol/markets';
import { useState } from 'react';

export const MarketHeader = () => {
  const { marketId } = useParams();
  const { data } = useMarket(marketId);
  const [open, setOpen] = useState(false);

  useMarketList();

  if (!data) return null;

  return (
    <Header
      title={
        <Popover
          open={open}
          onChange={setOpen}
          trigger={
            <HeaderTitle>
              {data.tradableInstrument.instrument.code}
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
      <MarketHeaderStats market={data} />
    </Header>
  );
};
