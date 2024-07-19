import {
  getAsset,
  getQuoteAsset,
  getBaseQuoteUnit,
  type MarketInfo,
  getQuoteName,
} from '@vegaprotocol/markets';
import {
  useAccountBalance,
  useMarginAccountBalance,
  useMarginMode,
} from '@vegaprotocol/accounts';
import { type Side } from '@vegaprotocol/types';

import { TicketContext } from '../ticket-context';
import { type TicketType } from '../schemas';

import { Market } from './market';
import { Limit } from './limit';
import { StopLimit } from './stop-limit';
import { StopMarket } from './stop-market';

import { useTicketType } from '../use-ticket-type';
import { useTicketSide } from '../use-ticket-side';

export const Ticket = ({ market }: { market: MarketInfo }) => {
  const settlementAsset = getAsset(market);
  const quoteAsset = getQuoteAsset(market);

  const marginAccount = useMarginAccountBalance(market.id);
  const generalAccount = useAccountBalance(settlementAsset?.id);
  const marginMode = useMarginMode(market.id);

  if (!settlementAsset) return null;
  if (!quoteAsset) return null;

  const instrument = market.tradableInstrument.instrument;
  const baseSymbol = getBaseQuoteUnit(instrument.metadata.tags);
  const quoteName = getQuoteName(market);

  if (!baseSymbol) return null;

  return (
    <TicketContext.Provider
      value={{
        type: 'default',
        market,
        quoteName,
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

export type FormProps = {
  side: Side;
  onSideChange: (value: Side) => void;
  onTypeChange: (value: TicketType) => void;
};

export const TicketDefaultSwitch = () => {
  const [side, setSide] = useTicketSide();
  const [type, setType] = useTicketType();

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
