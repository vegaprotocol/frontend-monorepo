import { TicketMarket } from './ticket-perp/ticket-market';
import { TicketLimit } from './ticket-perp/ticket-limit';
import { TicketStopLimit } from './ticket-perp/ticket-stop-limit';
import { TicketStopMarket } from './ticket-perp/ticket-stop-market';
import { type TicketType, useTicketType } from './use-ticket-type';

export type FormProps = {
  onTypeChange: (value: TicketType) => void;
};

export const TicketPerp = () => {
  const [ticketType, setTicketType] = useTicketType();

  const props: FormProps = {
    onTypeChange: (value: TicketType) => setTicketType(value),
  };

  switch (ticketType) {
    case 'market': {
      return <TicketMarket {...props} />;
    }

    case 'limit': {
      return <TicketLimit {...props} />;
    }

    case 'stopMarket': {
      return <TicketStopMarket {...props} />;
    }

    case 'stopLimit': {
      return <TicketStopLimit {...props} />;
    }

    default: {
      throw new Error('invalid order type');
    }
  }
};
