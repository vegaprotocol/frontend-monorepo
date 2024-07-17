import {
  getBaseAsset,
  getQuoteAsset,
  type MarketInfo,
} from '@vegaprotocol/markets';
import { useAccountBalance, useMarginMode } from '@vegaprotocol/accounts';
import { type Side } from '@vegaprotocol/types';

import { type TicketType } from '../schemas';
import { TicketContext } from '../ticket-context';
import { TicketMarket } from './ticket-market';
import { TicketLimit } from './ticket-limit';
import { TicketStopMarket } from './ticket-stop-market';
import { TicketStopLimit } from './ticket-stop-limit';
import { useTicketType } from '../use-ticket-type';
import { useTicketSide } from '../use-ticket-side';

export const Ticket = ({ market }: { market: MarketInfo }) => {
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

export type FormProps = {
  side: Side;
  onSideChange: (value: Side) => void;
  onTypeChange: (value: TicketType) => void;
};

export const TicketSpotSwitch = () => {
  const [type, setType] = useTicketType();
  const [side, setSide] = useTicketSide();

  const props: FormProps = {
    side,
    onSideChange: (value: Side) => setSide(value),
    onTypeChange: (value: TicketType) => setType(value),
  };

  switch (type) {
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
