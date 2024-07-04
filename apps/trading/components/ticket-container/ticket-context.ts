import { MarketInfo } from '@vegaprotocol/markets';
import { createContext, useContext } from 'react';

type TicketContextValue = {
  market: MarketInfo;
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
