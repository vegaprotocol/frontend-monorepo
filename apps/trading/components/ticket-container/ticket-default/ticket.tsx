import {
  getAsset,
  getQuoteAsset,
  type MarketInfo,
} from '@vegaprotocol/markets';
import { getBaseQuoteUnit } from '@vegaprotocol/deal-ticket';
import {
  useAccountBalance,
  useMarginAccountBalance,
  useMarginMode,
} from '@vegaprotocol/accounts';

import { TicketContext } from '../ticket-context';
import { type TicketType } from '../schemas';
import { useTicketType } from '../use-ticket-type';

import { TicketMarket } from './ticket-market';
import { TicketLimit } from './ticket-limit';
import { TicketStopLimit } from './ticket-stop-limit';
import { TicketStopMarket } from './ticket-stop-market';

export type FormProps = {
  onTypeChange: (value: TicketType) => void;
};

export const Ticket = ({ market }: { market: MarketInfo }) => {
  const settlementAsset = market && getAsset(market);
  const quoteAsset = market && getQuoteAsset(market);

  const marginAccount = useMarginAccountBalance(market.id);
  const generalAccount = useAccountBalance(settlementAsset?.id);
  const marginMode = useMarginMode(market.id);

  if (!settlementAsset) return null;
  if (!quoteAsset) return null;

  const instrument = market.tradableInstrument.instrument;
  const baseSymbol = getBaseQuoteUnit(instrument.metadata.tags);

  if (!baseSymbol) return null;

  return (
    <TicketContext.Provider
      value={{
        type: 'default',
        market,
        quoteAsset,
        baseSymbol,
        settlementAsset,
        accounts: {
          general: generalAccount.accountBalance || '0',
          margin: marginAccount.marginAccountBalance || '0',
          orderMargin: marginAccount.orderMarginAccountBalance || '0',
        },
        marginMode: {
          mode: marginMode.data.marginMode,
          factor: marginMode.data.marginFactor,
        },
      }}
    >
      <TicketDefaultSwitch />
    </TicketContext.Provider>
  );
};

export const TicketDefaultSwitch = () => {
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
