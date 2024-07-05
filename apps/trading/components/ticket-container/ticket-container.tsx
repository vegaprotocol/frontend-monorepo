import { useParams } from 'react-router-dom';

import { getProductType, useMarketInfo } from '@vegaprotocol/markets';

import { TicketFuture } from './ticket-future';
import { TicketPerp } from './ticket-perp';
import { TicketSpot } from './ticket-spot';
import { TicketContext, useTicketContext } from './ticket-context';

export const TicketContainer = () => {
  const params = useParams();
  const { data: market } = useMarketInfo(params.marketId);

  if (!market) return null;

  return (
    <TicketContext.Provider value={{ market }}>
      <div className="p-2">
        <TicketSwitch />
      </div>
    </TicketContext.Provider>
  );
};

const TicketSwitch = () => {
  const { market } = useTicketContext();
  const productType = getProductType(market);

  switch (productType) {
    case 'Future': {
      return <TicketFuture />;
    }
    case 'Perpetual': {
      return <TicketPerp />;
    }
    case 'Spot': {
      return <TicketSpot />;
    }
    default: {
      throw new Error('invalid product type');
    }
  }
};
