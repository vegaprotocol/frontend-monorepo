import { TicketMarket } from './ticket-spot/ticket-market';
import { type TicketType, useTicketType } from './use-ticket-type';

export type FormProps = {
  onTypeChange: (value: TicketType) => void;
};

export const TicketSpot = () => {
  const [ticketType, setTicketType] = useTicketType();

  const props: FormProps = {
    onTypeChange: (value: TicketType) => setTicketType(value),
  };

  switch (ticketType) {
    case 'market': {
      return <TicketMarket {...props} />;
    }

    case 'limit': {
      throw new Error('spot limit ticket not implemented');
    }

    case 'stopMarket': {
      throw new Error('spot stop market ticket not implemented');
    }

    case 'stopLimit': {
      throw new Error('spot stop limit ticket not implemented');
    }

    default: {
      throw new Error('invalid order type');
    }
  }
};
