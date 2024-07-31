import {
  getBaseAsset,
  getQuoteAsset,
  type MarketInfo,
} from '@vegaprotocol/markets';
import { useAccountBalance, useMarginMode } from '@vegaprotocol/accounts';
import { type Side } from '@vegaprotocol/types';

import { type TicketType } from '../schemas';
import { TicketContext } from '../ticket-context';
import { Market } from './market';
import { Limit } from './limit';
import { StopMarket } from './stop-market';
import { StopLimit } from './stop-limit';
import { useTicketType } from '../use-ticket-type';
import { useTicketSide } from '../use-ticket-side';

/**
 * Renders a spot ticket, within a context provider, which provides
 * all the information required for the spot ticket to function.
 * The ticket type can be one of TicketType (market, limit, stopMarket, stopLimit)
 */
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
        baseSymbol: baseAsset.symbol,
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
