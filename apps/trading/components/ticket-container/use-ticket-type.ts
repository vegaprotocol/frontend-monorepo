import { useState } from 'react';

export type TicketType = 'market' | 'limit' | 'stopMarket' | 'stopLimit';

export const useTicketType = () => {
  return useState<TicketType>('market');
};
