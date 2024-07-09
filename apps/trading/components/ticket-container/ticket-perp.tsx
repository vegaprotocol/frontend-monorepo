import { type TicketType } from './types';
import { useState } from 'react';

import { TicketMarket } from './ticket-perp/ticket-market';
import { TicketLimit } from './ticket-perp/ticket-limit';
import { TicketStopLimit } from './ticket-perp/ticket-stop-limit';

export type FormProps = {
  onTypeChange: (value: TicketType) => void;
};

export const TicketPerp = () => {
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
      return <FormStopMarket />;
    }

    case 'stopLimit': {
      return <TicketStopLimit {...props} />;
    }

    default: {
      throw new Error('invalid order type');
    }
  }
};

const FormStopMarket = () => {
  return <div>Form stop market</div>;
};
