import { useParams } from 'react-router-dom';

import {
  getProductType,
  useMarketInfo,
  type MarketInfo,
} from '@vegaprotocol/markets';

import { TicketFuture } from './ticket-future';
import { TicketPerp } from './ticket-perp';
import { TicketSpot } from './ticket-spot';
import { TicketContext } from './ticket-context';

export const TicketContainer = () => {
  const params = useParams();
  const { data: market } = useMarketInfo(params.marketId);

  if (!market) return null;

  return (
    <TicketContext.Provider value={{ market }}>
      <div className="p-2">
        <TicketSwitch market={market} />
      </div>
    </TicketContext.Provider>
  );
};

const TicketSwitch = ({ market }: { market: MarketInfo }) => {
  const productType = getProductType(market);

  const props = { market };

  switch (productType) {
    case 'Future': {
      // @ts-ignore set up props
      return <TicketFuture {...props} />;
    }
    case 'Perpetual': {
      return <TicketPerp {...props} />;
    }
    case 'Spot': {
      // @ts-ignore set up props
      return <TicketSpot {...props} />;
    }
    default: {
      throw new Error('invalid product type');
    }
  }
};
