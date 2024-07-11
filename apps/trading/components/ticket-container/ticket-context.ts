import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { type MarketInfo } from '@vegaprotocol/markets';
import { type MarginMode } from '@vegaprotocol/types';
import { createContext, useContext } from 'react';

// Perps and Futures can use the same context
type DefaultContextValue = {
  type: 'default';
  market: MarketInfo;
  baseSymbol: string;
  quoteAsset: AssetFieldsFragment;
  settlementAsset: AssetFieldsFragment;
  accounts: {
    general: string;
    margin: string;
    orderMargin: string;
  };
  marginMode: {
    mode: MarginMode;
    factor: string;
  };
};

type SpotContextValue = {
  type: 'spot';
  market: MarketInfo;
  baseAsset: AssetFieldsFragment;
  quoteAsset: AssetFieldsFragment;
  accounts: {
    general: string;
    margin: string;
    orderMargin: string;
  };
  marginMode: {
    mode: MarginMode;
    factor: string;
  };
};

type TicketContextValue = DefaultContextValue | SpotContextValue;

export const TicketContext = createContext<TicketContextValue>(
  {} as TicketContextValue
);

/**
 * Retrieve ticket context which can be narrowed by using the context type value
 */
export function useTicketContext<T extends TicketContextValue['type']>(_?: T) {
  const ticketContext = useContext(TicketContext);

  if (!ticketContext) {
    throw new Error(
      'useTicketContext should be used within <TickContextProvider>'
    );
  }

  return ticketContext as Extract<TicketContextValue, { type: T }>;
}
