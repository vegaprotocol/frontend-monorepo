import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { type MarketInfo } from '@vegaprotocol/markets';
import { type MarginMode } from '@vegaprotocol/types';
import { createContext, useContext } from 'react';

type TicketContextValue = {
  market: MarketInfo;
  baseAsset?: AssetFieldsFragment;
  baseSymbol?: string;
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

export const TicketContext = createContext<TicketContextValue>(
  {} as TicketContextValue
);

export const useTicketContext = () => {
  const ticketContext = useContext(TicketContext);

  if (!ticketContext) {
    throw new Error(
      'useTicketContext should be used within <TickContextProvider>'
    );
  }

  return ticketContext;
};
