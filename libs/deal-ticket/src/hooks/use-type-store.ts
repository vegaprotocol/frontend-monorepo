import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

export enum DealTicketType {
  Limit = 'Limit',
  Market = 'Market',
  StopLimit = 'StopLimit',
  StopMarket = 'StopMarket',
}

export const useDealTicketTypeStore = create<{
  set: (marketId: string, type: DealTicketType) => void;
  type: Record<string, DealTicketType>;
}>()(
  persist(
    subscribeWithSelector((set) => ({
      type: {},
      set: (marketId: string, type: DealTicketType) =>
        set((state) => ({
          ...state,
          type: { ...state.type, [marketId]: type },
        })),
    })),
    {
      name: 'deal_ticket_type',
    }
  )
);
