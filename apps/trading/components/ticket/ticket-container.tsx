import { useParams } from 'react-router-dom';

import {
  type MarketInfo,
  getProductType,
  useMarketInfo,
} from '@vegaprotocol/markets';

import { Ticket as DerivativeTicket } from './derivative/ticket';
import { Ticket as SpotTicket } from './spot/ticket';

/**
 * Renders the deal ticket after fetching for the current market
 * by url params
 */
export const TicketContainer = () => {
  const params = useParams();
  const { data: market } = useMarketInfo(params.marketId);

  if (!market) return null;

  return (
    <div className="p-3">
      <TicketContainerSwitch market={market} />
    </div>
  );
};

/** Switch the ticket based on product type */
const TicketContainerSwitch = ({ market }: { market: MarketInfo }) => {
  const productType = getProductType(market);

  switch (productType) {
    case 'Future':
    case 'Perpetual': {
      return <DerivativeTicket market={market} />;
    }
    case 'Spot': {
      return <SpotTicket market={market} />;
    }
    default: {
      throw new Error('invalid product type');
    }
  }
};
