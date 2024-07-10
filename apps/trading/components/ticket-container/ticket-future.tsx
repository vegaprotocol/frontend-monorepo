import { type TicketType } from './types';
import { useState } from 'react';

import { TicketMarket } from './ticket-future/ticket-market';
import { TicketLimit } from './ticket-future/ticket-limit';
import { TicketStopLimit } from './ticket-future/ticket-stop-limit';
import { TicketStopMarket } from './ticket-future/ticket-stop-market';

export type FormProps = {
  onTypeChange: (value: TicketType) => void;
};

export const TicketFuture = () => {
  const [ticketType, setTicketType] = useState<TicketType>('limit');

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
