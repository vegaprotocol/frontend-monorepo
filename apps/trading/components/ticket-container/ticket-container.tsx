import { useParams } from 'react-router-dom';

import {
  getAsset,
  getBaseAsset,
  getProductType,
  getQuoteAsset,
  isSpot,
  useMarketInfo,
} from '@vegaprotocol/markets';

import { TicketFuture } from './ticket-future';
import { TicketPerp } from './ticket-perp';
import { TicketSpot } from './ticket-spot';
import { TicketContext, useTicketContext } from './ticket-context';
import {
  useAccountBalance,
  useMarginAccountBalance,
} from '@vegaprotocol/accounts';
import { getBaseQuoteUnit } from '@vegaprotocol/deal-ticket';

export const TicketContainer = () => {
  const params = useParams();

  const { data: market } = useMarketInfo(params.marketId);
  const settlementAsset = market && getAsset(market);
  const quoteAsset = market && getQuoteAsset(market);
  const marginAccount = useMarginAccountBalance(params.marketId);
  const generalAccount = useAccountBalance(settlementAsset?.id);

  if (!market) return null;
  if (!settlementAsset) return null;
  if (!quoteAsset) return null;

  const instrument = market.tradableInstrument.instrument;
  const baseAsset = isSpot(instrument.product)
    ? getBaseAsset(market)
    : undefined;
  const baseSymbol = getBaseQuoteUnit(instrument.metadata.tags);

  return (
    <TicketContext.Provider
      value={{
        market,
        quoteAsset,
        baseAsset: baseAsset || undefined,
        baseSymbol,
        settlementAsset,
        accounts: {
          general: generalAccount.accountBalance,
          margin: marginAccount.marginAccountBalance,
          orderMargin: marginAccount.orderMarginAccountBalance,
        },
      }}
    >
      <div className="p-2">
        <TicketSwitch />
      </div>
    </TicketContext.Provider>
  );
};

const TicketSwitch = () => {
  const { market } = useTicketContext();
  const productType = getProductType(market);

  switch (productType) {
    case 'Future': {
      return <TicketFuture />;
    }
    case 'Perpetual': {
      return <TicketPerp />;
    }
    case 'Spot': {
      return <TicketSpot />;
    }
    default: {
      throw new Error('invalid product type');
    }
  }
};
