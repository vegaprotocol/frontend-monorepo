import { getAsset, type MarketInfo, getQuoteUnit } from '@vegaprotocol/markets';
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
import { useT } from '../../../lib/use-t';

/**
 * Renders a default ticket (for future or perpetual markets), within a
 * context provider, which provides all the information required for the
 * ticket to function. The ticket type can be one of
 * TicketType (market, limit, stopMarket, stopLimit)
 */
export const Ticket = ({ market }: { market: MarketInfo }) => {
  const t = useT();
  const instrument = market.tradableInstrument.instrument;
  const settlementAsset = getAsset(market);
  const marginAccount = useMarginAccountBalance(market.id);
  const generalAccount = useAccountBalance(settlementAsset?.id);
  const marginMode = useMarginMode(market.id);
  const baseSymbol = t('Contracts');
  const quoteSymbol = getQuoteUnit(instrument.metadata.tags);

  return (
    <TicketContext.Provider
      value={{
        type: 'default',
        market,
        quoteSymbol,
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
