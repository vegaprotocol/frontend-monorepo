import { useState, type ComponentType } from 'react';
import { TicketType } from './types';

type SubTicket = ComponentType<{ onTypeChange: (value: TicketType) => void }>;

export const TicketTypeSwitch = ({
  Market,
  Limit,
  StopMarket,
  StopLimit,
}: {
  Market: SubTicket;
  Limit: SubTicket;
  StopMarket: SubTicket;
  StopLimit: SubTicket;
}) => {
  const [ticketType, setTicketType] = useState<TicketType>('market');

  const props = {
    onTypeChange: (value: TicketType) => setTicketType(value),
  };

  switch (ticketType) {
    case 'market': {
      return <Market {...props} />;
    }

    case 'limit': {
      return <Limit {...props} />;
    }

    case 'stopMarket': {
      return <StopMarket {...props} />;
    }

    case 'stopLimit': {
      return <StopLimit {...props} />;
    }

    default: {
      throw new Error('invalid order type');
    }
  }
};
