import { useParams } from 'react-router-dom';

import { getProductType, useMarketInfo } from '@vegaprotocol/markets';

import { TicketFuture } from './ticket-future';
import { TicketPerp } from './ticket-perp';
import { TicketSpot } from './ticket-spot';

export const TicketContainer = () => {
  const params = useParams();

  const { data: market } = useMarketInfo(params.marketId);

  if (!market) return null;

  const productType = getProductType(market);

  switch (productType) {
    case 'Future': {
      return <TicketFuture market={market} />;
    }
    case 'Perpetual': {
      return <TicketPerp market={market} />;
    }
    case 'Spot': {
      return <TicketSpot market={market} />;
    }
    default: {
      throw new Error('invalid product type');
    }
  }
};
