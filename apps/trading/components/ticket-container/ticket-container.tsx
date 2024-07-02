import {
  MarketFieldsFragment,
  getProductType,
  useMarket,
} from '@vegaprotocol/markets';
import { useParams } from 'react-router-dom';
import { TicketFuture } from './ticket-future';
import { TicketPerp } from './ticket-perp';
import { TicketSpot } from './ticket.spot';

export const TicketContainer = () => {
  const params = useParams();
  const { data: market } = useMarket(params.marketId);

  if (!market) return null;

  return (
    <div className="p-2">
      <TicketSwitch market={market} />
    </div>
  );
};

const TicketSwitch = ({ market }: { market: MarketFieldsFragment }) => {
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
