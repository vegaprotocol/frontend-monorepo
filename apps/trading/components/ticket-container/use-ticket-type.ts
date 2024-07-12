import { useState } from 'react';
import { type TicketType } from './schemas';

export const useTicketType = () => {
  return useState<TicketType>('market');
};
