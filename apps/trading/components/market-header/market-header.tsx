import { Popover, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { Header, HeaderTitle } from '../header';
import { useParams } from 'react-router-dom';
import { MarketSelector } from '../../components/market-selector/market-selector';
import { MarketHeaderStats } from '../../client-pages/market/market-header-stats';
import { useMarket } from '@vegaprotocol/markets';

export const MarketHeader = () => {
  const { marketId } = useParams();
  const { data } = useMarket(marketId);

  if (!data) return null;

  return (
    <Header
      title={
        <Popover
          trigger={
            <HeaderTitle>
              {data.tradableInstrument.instrument.code}
              <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={14} />
            </HeaderTitle>
          }
        >
          <MarketSelector currentMarketId={marketId} />
        </Popover>
      }
    >
      <MarketHeaderStats market={data} />
    </Header>
  );
};
