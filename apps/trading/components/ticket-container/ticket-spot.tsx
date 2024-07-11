import {
  getBaseAsset,
  getQuoteAsset,
  type MarketInfo,
} from '@vegaprotocol/markets';
import { TicketMarket } from './ticket-spot/ticket-market';
import { type TicketType, useTicketType } from './use-ticket-type';
import {
  useAccountBalance,
  useMarginAccountBalance,
  useMarginMode,
} from '@vegaprotocol/accounts';
import { TicketContext } from './ticket-context';

export type FormProps = {
  onTypeChange: (value: TicketType) => void;
};

export const TicketSpot = ({ market }: { market: MarketInfo }) => {
  const quoteAsset = getQuoteAsset(market);
  const baseAsset = getBaseAsset(market);
  const marginAccount = useMarginAccountBalance(market.id);
  const generalAccount = useAccountBalance(quoteAsset?.id);
  const marginMode = useMarginMode(market.id);

  if (!baseAsset) return null;
  if (!quoteAsset) return null;

  return (
    <TicketContext.Provider
      value={{
        type: 'Spot',
        market,
        baseAsset,
        quoteAsset,
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
