import { useLocalStorage } from '@vegaprotocol/react-helpers';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useMemo } from 'react';

type OrderData = OrderSubmissionBody['orderSubmission'] | null;

export const usePersistedOrder = (market: {
  id: string;
}): [OrderData, (value: OrderData) => void] => {
  const [value, setValue] = useLocalStorage(`deal-ticket-order-${market.id}`);
  const order = value != null ? (JSON.parse(value) as OrderData) : null;
  return useMemo<[OrderData, (value: OrderData) => void]>(
    () => [order, (order: OrderData) => setValue(JSON.stringify(order))],
    [order, setValue]
  );
};
