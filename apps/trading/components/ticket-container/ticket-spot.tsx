import {
  getBaseAsset,
  getQuoteAsset,
  type MarketInfo,
} from '@vegaprotocol/markets';
import { useAccountBalance, useMarginMode } from '@vegaprotocol/accounts';

import { TicketMarket } from './ticket-spot/ticket-market';
import { TicketLimit } from './ticket-spot/ticket-limit';
import { TicketStopMarket } from './ticket-spot/ticket-stop-market';
import { TicketStopLimit } from './ticket-spot/ticket-stop-limit';
import { useTicketType } from './use-ticket-type';
import { TicketContext } from './ticket-context';
import { type TicketType } from './schemas';

export type FormProps = {
  onTypeChange: (value: TicketType) => void;
};

export const TicketSpot = ({ market }: { market: MarketInfo }) => {
  const quoteAsset = getQuoteAsset(market);
  const baseAsset = getBaseAsset(market);

  const baseAccount = useAccountBalance(baseAsset?.id);
  const quoteAccount = useAccountBalance(quoteAsset?.id);

  const marginMode = useMarginMode(market.id);

  if (!baseAsset) return null;
  if (!quoteAsset) return null;

  return (
    <TicketContext.Provider
      value={{
        type: 'spot',
        market,
        baseAsset,
        quoteAsset,
        accounts: {
          base: baseAccount.accountBalance || '0',
          quote: quoteAccount.accountBalance || '0',
        },
        marginMode: {
          mode: marginMode.data.marginMode,
          factor: marginMode.data.marginFactor,
        },
      }}
    >
      <TicketSpotSwitch />
    </TicketContext.Provider>
  );
};

export const TicketSpotSwitch = () => {
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
