import { type MarginMode } from '@vegaprotocol/types';
import { type TicketType } from './types';
import { useMarginMode } from '@vegaprotocol/accounts';
import { useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { TicketMarket } from './ticket-perp/ticket-market';
import { TicketLimit } from './ticket-perp/ticket-limit';
import { useTicketContext } from './ticket-context';

export type FormProps = {
  margin: { mode?: MarginMode; factor?: string };
  onTypeChange: (value: TicketType) => void;
};

export const TicketPerp = () => {
  const [ticketType, setTicketType] = useState<TicketType>('market');
  const { pubKey } = useVegaWallet();
  const { market } = useTicketContext();
  const marginMode = useMarginMode({ marketId: market.id, partyId: pubKey });

  const props: FormProps = {
    onTypeChange: (value: TicketType) => setTicketType(value),
    margin: {
      mode: marginMode.data?.marginMode,
      factor: marginMode.data?.marginFactor,
    },
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
      return <FormStopLimit />;
    }

    default: {
      throw new Error('invalid order type');
    }
  }
};

const FormStopMarket = () => {
  return <div>Form stop market</div>;
};

const FormStopLimit = () => {
  return <div>Form stop limit</div>;
};
