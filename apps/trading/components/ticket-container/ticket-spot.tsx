import {
  getBaseAsset,
  getQuoteAsset,
  type MarketInfo,
} from '@vegaprotocol/markets';
import { TicketMarket } from './ticket-spot/ticket-market';
import { useTicketType } from './use-ticket-type';
import { useAccountBalance, useMarginMode } from '@vegaprotocol/accounts';
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
